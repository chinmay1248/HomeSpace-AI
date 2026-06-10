from __future__ import annotations

import argparse
import shutil
from pathlib import Path


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare a YOLOv8 door/window dataset split.")
    parser.add_argument("--images", required=True, type=Path, help="Directory containing floor-plan images.")
    parser.add_argument("--labels", required=True, type=Path, help="Directory containing YOLO txt labels.")
    parser.add_argument("--output", required=True, type=Path, help="Output dataset directory.")
    parser.add_argument("--val-ratio", default=0.15, type=float, help="Validation split ratio.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    images = sorted(path for path in args.images.rglob("*") if path.suffix.lower() in IMAGE_EXTENSIONS)
    if not images:
        raise SystemExit("No images found.")

    split_at = max(1, int(len(images) * (1 - args.val_ratio)))
    splits = {"train": images[:split_at], "val": images[split_at:]}

    for split_name, split_images in splits.items():
        image_out = args.output / "images" / split_name
        label_out = args.output / "labels" / split_name
        image_out.mkdir(parents=True, exist_ok=True)
        label_out.mkdir(parents=True, exist_ok=True)
        for image in split_images:
            label = args.labels / f"{image.stem}.txt"
            if not label.exists():
                continue
            shutil.copy2(image, image_out / image.name)
            shutil.copy2(label, label_out / label.name)

    yaml_path = args.output / "dataset.yaml"
    yaml_path.write_text(
        "\n".join(
            [
                f"path: {args.output.resolve().as_posix()}",
                "train: images/train",
                "val: images/val",
                "names:",
                "  0: door",
                "  1: window",
                "  2: bed",
                "  3: toilet",
                "  4: sink",
                "  5: stove",
                "  6: dining_table",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(f"Prepared YOLO dataset at {args.output}")
    print(f"Dataset YAML: {yaml_path}")


if __name__ == "__main__":
    main()
