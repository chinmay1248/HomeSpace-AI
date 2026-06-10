from __future__ import annotations

import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train YOLOv8 for MetaNest door/window detection.")
    parser.add_argument("--data", required=True, type=Path, help="YOLO dataset.yaml path.")
    parser.add_argument("--model", default="yolov8n.pt", help="Base YOLOv8 checkpoint.")
    parser.add_argument("--epochs", default=80, type=int)
    parser.add_argument("--imgsz", default=1024, type=int)
    parser.add_argument("--batch", default=8, type=int)
    parser.add_argument("--project", default="runs/metanest-openings")
    return parser.parse_args()


def main() -> None:
    try:
        from ultralytics import YOLO
    except ImportError as exc:
        raise SystemExit("Install backend/requirements-ai.txt before training YOLOv8.") from exc

    args = parse_args()
    if not args.data.exists():
        raise SystemExit(f"Dataset yaml not found: {args.data}")

    model = YOLO(args.model)
    model.train(
        data=str(args.data),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name="floor-plan-symbols",
    )


if __name__ == "__main__":
    main()
