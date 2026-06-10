from __future__ import annotations

import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a compact U-Net room segmentation model.")
    parser.add_argument("--images", required=True, type=Path, help="Training image directory.")
    parser.add_argument("--masks", required=True, type=Path, help="Training mask directory with matching file stems.")
    parser.add_argument("--output", default="models/unet_rooms.pt", type=Path)
    parser.add_argument("--epochs", default=30, type=int)
    parser.add_argument("--batch", default=4, type=int)
    parser.add_argument(
        "--classes",
        default=8,
        type=int,
        help="Number of segmentation classes (e.g., 0: bg, 1: wall, 2: hall, 3: bed, 4: bath, 5: kitchen, 6: balcony, 7: study).",
    )
    parser.add_argument("--size", default=512, type=int)
    return parser.parse_args()


def main() -> None:
    try:
        import cv2
        import torch
        from torch import nn
        from torch.utils.data import DataLoader, Dataset
        from tqdm import tqdm
    except ImportError as exc:
        raise SystemExit("Install backend/requirements-ai.txt before training U-Net.") from exc

    args = parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)

    class RoomDataset(Dataset):
        def __init__(self, images: Path, masks: Path, size: int) -> None:
            self.images = sorted(path for path in images.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png"})
            self.masks = masks
            self.size = size

        def __len__(self) -> int:
            return len(self.images)

        def __getitem__(self, index: int):
            image_path = self.images[index]
            mask_path = self.masks / f"{image_path.stem}.png"
            image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
            mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
            if image is None or mask is None:
                raise FileNotFoundError(f"Missing image or mask for {image_path.stem}")
            image = cv2.resize(image, (self.size, self.size), interpolation=cv2.INTER_AREA)
            mask = cv2.resize(mask, (self.size, self.size), interpolation=cv2.INTER_NEAREST)
            image_tensor = torch.from_numpy(image).float().div(255.0).unsqueeze(0)
            mask_tensor = torch.from_numpy(mask).long()
            return image_tensor, mask_tensor

    class Block(nn.Module):
        def __init__(self, in_channels: int, out_channels: int) -> None:
            super().__init__()
            self.layers = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, 3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
            )

        def forward(self, tensor):
            return self.layers(tensor)

    class SmallUNet(nn.Module):
        def __init__(self, classes: int) -> None:
            super().__init__()
            self.down1 = Block(1, 32)
            self.pool1 = nn.MaxPool2d(2)
            self.down2 = Block(32, 64)
            self.pool2 = nn.MaxPool2d(2)
            self.bridge = Block(64, 128)
            self.up2 = nn.ConvTranspose2d(128, 64, 2, stride=2)
            self.dec2 = Block(128, 64)
            self.up1 = nn.ConvTranspose2d(64, 32, 2, stride=2)
            self.dec1 = Block(64, 32)
            self.head = nn.Conv2d(32, classes, 1)

        def forward(self, tensor):
            down1 = self.down1(tensor)
            down2 = self.down2(self.pool1(down1))
            bridge = self.bridge(self.pool2(down2))
            up2 = self.up2(bridge)
            dec2 = self.dec2(torch.cat([up2, down2], dim=1))
            up1 = self.up1(dec2)
            dec1 = self.dec1(torch.cat([up1, down1], dim=1))
            return self.head(dec1)

    dataset = RoomDataset(args.images, args.masks, args.size)
    if len(dataset) == 0:
        raise SystemExit("No training images found.")

    loader = DataLoader(dataset, batch_size=args.batch, shuffle=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SmallUNet(args.classes).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(args.epochs):
        model.train()
        total_loss = 0.0
        for images, masks in tqdm(loader, desc=f"epoch {epoch + 1}/{args.epochs}"):
            images = images.to(device)
            masks = masks.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), masks)
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item())
        print(f"loss={total_loss / len(loader):.4f}")

    scripted = torch.jit.script(model.cpu())
    scripted.save(str(args.output))
    print(f"Saved TorchScript model to {args.output}")


if __name__ == "__main__":
    main()
