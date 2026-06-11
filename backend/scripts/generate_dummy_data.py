from __future__ import annotations

import argparse
import cv2
import numpy as np
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate small synthetic MetaNest demo/training assets.")
    parser.add_argument(
        "--output",
        default=Path("docs/demo-assets/dummy_raw"),
        type=Path,
        help="Directory where images, labels, and masks are written.",
    )
    parser.add_argument("--num-images", default=5, type=int, help="Number of synthetic plans to create.")
    parser.add_argument("--size", default=512, type=int, help="Square image size in pixels.")
    return parser.parse_args()


def generate_dummy_data(output_dir: Path, num_images: int = 5, size: int = 512) -> None:
    images_dir = output_dir / "images"
    labels_dir = output_dir / "labels"
    masks_dir = output_dir / "masks"

    images_dir.mkdir(parents=True, exist_ok=True)
    labels_dir.mkdir(parents=True, exist_ok=True)
    masks_dir.mkdir(parents=True, exist_ok=True)

    margin = max(24, size // 10)
    room_split = size // 2
    outer_max = size - margin
    wall_width = max(3, size // 128)

    for index in range(num_images):
        img = np.ones((size, size, 3), dtype=np.uint8) * 255
        mask = np.zeros((size, size), dtype=np.uint8)

        cv2.rectangle(img, (margin, margin), (outer_max, outer_max), (0, 0, 0), wall_width)
        cv2.line(img, (room_split, margin), (room_split, outer_max), (0, 0, 0), wall_width)

        mask[margin:outer_max, margin:room_split] = 3
        mask[margin:outer_max, room_split:outer_max] = 5
        cv2.rectangle(mask, (margin, margin), (outer_max, outer_max), 1, wall_width)
        cv2.line(mask, (room_split, margin), (room_split, outer_max), 1, wall_width)

        door_top = int(size * 0.39)
        door_bottom = int(size * 0.49)
        opening_half_width = max(8, size // 48)
        window_top = int(size * 0.59)
        window_bottom = int(size * 0.68)

        cv2.rectangle(
            img,
            (room_split - opening_half_width, door_top),
            (room_split + opening_half_width, door_bottom),
            (255, 0, 0),
            -1,
        )
        cv2.rectangle(
            img,
            (margin - opening_half_width, window_top),
            (margin + opening_half_width, window_bottom),
            (0, 255, 0),
            -1,
        )

        door_cx = room_split / size
        door_cy = ((door_top + door_bottom) / 2) / size
        door_w = (opening_half_width * 2) / size
        door_h = (door_bottom - door_top) / size
        window_cx = margin / size
        window_cy = ((window_top + window_bottom) / 2) / size
        window_w = (opening_half_width * 2) / size
        window_h = (window_bottom - window_top) / size
        labels_content = f"0 {door_cx} {door_cy} {door_w} {door_h}\n1 {window_cx} {window_cy} {window_w} {window_h}\n"

        cv2.imwrite(str(images_dir / f"dummy_{index}.png"), img)
        cv2.imwrite(str(masks_dir / f"dummy_{index}.png"), mask)
