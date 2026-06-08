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

