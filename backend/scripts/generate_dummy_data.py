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
