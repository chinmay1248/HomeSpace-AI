from __future__ import annotations

import argparse
from pathlib import Path

import cv2

from app.ai.room_segmenter import UNetRoomSegmenter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run U-Net room segmentation for one floor plan.")
    parser.add_argument("--image", required=True, type=Path)
    parser.add_argument("--model", required=True)
    parser.add_argument("--output", default="room_mask.png", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    mask = UNetRoomSegmenter(args.model).predict_mask(args.image)
    if mask is None:
        raise SystemExit("No mask generated.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(args.output), mask)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
