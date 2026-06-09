from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np


class UNetRoomSegmenter:
    """Optional U-Net inference wrapper for room masks.

    It expects a TorchScript model that returns class logits shaped
    `[1, classes, height, width]`. The base system falls back to contour rooms
    when no model path is configured.
    """

    def __init__(self, model_path: str | None = None, input_size: int = 512) -> None:
        self.model_path = model_path
        self.input_size = input_size

    @property
    def enabled(self) -> bool:
        return bool(self.model_path)

    def predict_mask(self, image_path: Path) -> np.ndarray | None:
        if not self.model_path:
            return None

        try:
            import torch
        except ImportError as exc:
            raise RuntimeError("Install backend/requirements-ai.txt to enable U-Net room segmentation.") from exc

        image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError("Unable to read image for room segmentation.")

        original_shape = image.shape[:2]
        resized = cv2.resize(image, (self.input_size, self.input_size), interpolation=cv2.INTER_AREA)
        tensor = torch.from_numpy(resized).float().div(255.0).unsqueeze(0).unsqueeze(0)

        model: Any = torch.jit.load(self.model_path, map_location="cpu")
        model.eval()
        with torch.no_grad():
            logits = model(tensor)
            mask = torch.argmax(logits, dim=1).squeeze(0).cpu().numpy().astype(np.uint8)

        return cv2.resize(mask, (original_shape[1], original_shape[0]), interpolation=cv2.INTER_NEAREST)
