from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2

from app.ai.opening_detector import YOLOOpeningDetector


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run YOLOv8 door/window inference for one floor plan.")
    parser.add_argument("--image", required=True, type=Path)
    parser.add_argument("--model", required=True)
    parser.add_argument("--output", default="opening_predictions.json", type=Path)
    parser.add_argument("--longest-side-meters", default=18.0, type=float)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image = cv2.imread(str(args.image))
    if image is None:
        raise SystemExit(f"Unable to read image: {args.image}")

    height, width = image.shape[:2]
    scale = args.longest_side_meters / max(width, height)
    doors, windows = YOLOOpeningDetector(args.model).detect(args.image, scale)
    payload = {
        "doors": [door.model_dump() for door in doors],
        "windows": [window.model_dump() for window in windows],
    }
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
