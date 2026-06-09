from __future__ import annotations

from pathlib import Path
from typing import Any

from app.models.schemas import Opening


class YOLOOpeningDetector:
    """Optional YOLOv8 detector for doors and windows.

    The class intentionally imports ultralytics lazily so the base API can run
    without GPU training dependencies. Configure `YOLO_OPENING_MODEL_PATH` to
    enable model inference in production.
    """

    def __init__(self, model_path: str | None = None, confidence_threshold: float = 0.35) -> None:
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold

    @property
    def enabled(self) -> bool:
        return bool(self.model_path)

    def detect(self, image_path: Path, scale: float) -> tuple[list[Opening], list[Opening]]:
        if not self.model_path:
            return [], []

        try:
            from ultralytics import YOLO
        except ImportError as exc:
            raise RuntimeError("Install backend/requirements-ai.txt to enable YOLOv8 opening detection.") from exc

        model = YOLO(self.model_path)
        results = model.predict(source=str(image_path), conf=self.confidence_threshold, verbose=False)
        doors: list[Opening] = []
        windows: list[Opening] = []

        for result in results:
            names: dict[int, str] = result.names or {}
            boxes: Any = result.boxes
            if boxes is None:
                continue
            for index, box in enumerate(boxes):
                cls_id = int(box.cls[0].item())
                label = names.get(cls_id, "").lower()
                if label not in {"door", "window"}:
                    continue

                x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
                confidence = float(box.conf[0].item())
                center = (round(((x1 + x2) / 2) * scale, 3), round(((y1 + y2) / 2) * scale, 3))
                width = round(max(x2 - x1, y2 - y1) * scale, 3)
                opening = Opening(
                    id=f"{label}_{index}",
                    type=label,
                    center=center,
                    width=max(width, 0.4),
                    confidence=confidence,
                )
                if label == "door":
                    doors.append(opening)
                else:
                    windows.append(opening)

        return doors, windows
