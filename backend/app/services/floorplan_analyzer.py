from __future__ import annotations

import math
from pathlib import Path
from uuid import uuid4

import cv2
import fitz
import numpy as np

from app.ai.opening_detector import YOLOOpeningDetector
from app.ai.room_segmenter import UNetRoomSegmenter
from app.models.schemas import LayoutAnalysis, Opening, Room, Wall, TextLabel
from app.ai.ocr_reader import ocr_reader


class FloorPlanAnalyzer:
    def __init__(self, yolo_opening_model_path: str | None = None, unet_room_model_path: str | None = None) -> None:
        self.opening_detector = YOLOOpeningDetector(yolo_opening_model_path)
        self.room_segmenter = UNetRoomSegmenter(unet_room_model_path)

    def analyze(self, file_path: Path) -> LayoutAnalysis:
        image = self._load_image(file_path)
        height, width = image.shape[:2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        threshold = cv2.adaptiveThreshold(
            blurred,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            31,
            9,
        )

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        cleaned = cv2.morphologyEx(threshold, cv2.MORPH_CLOSE, kernel, iterations=2)
        edges = cv2.Canny(cleaned, 50, 150, apertureSize=3)
        walls = self._detect_walls(edges, width, height)
        rooms = self._detect_rooms(cleaned, width, height)
        doors, windows = self._detect_openings(walls, rooms)
        ai_metadata: dict[str, object] = {"opening_detector": "heuristic", "room_segmenter": "contour"}
        text_labels = []

        if self.opening_detector.enabled and file_path.suffix.lower() != ".pdf":
            model_doors, model_windows = self.opening_detector.detect(file_path, self._scale(width, height))
            if model_doors or model_windows:
                doors, windows = model_doors, model_windows
                ai_metadata["opening_detector"] = "yolov8"

        if self.room_segmenter.enabled and file_path.suffix.lower() != ".pdf":
            mask = self.room_segmenter.predict_mask(file_path)
            if mask is not None:
                ai_metadata["room_segmenter"] = "unet"
                ai_metadata["segmentation_classes"] = int(mask.max()) + 1

        if file_path.suffix.lower() != ".pdf":
            extracted_data = ocr_reader.extract_text(image)
            if extracted_data:
                ai_metadata["ocr"] = "easyocr"
                for data in extracted_data:
                    scaled_bbox = [self._normalize((int(x), int(y)), width, height) for x, y in data["bbox"]]
                    text_labels.append(TextLabel(text=data["text"], bbox=scaled_bbox, confidence=data["confidence"]))

        return LayoutAnalysis(
            source_size=(width, height),
            scale=self._scale(width, height),
            walls=walls,
            rooms=rooms,
            doors=doors,
            windows=windows,
            text_labels=text_labels,
            metadata={
                "edge_pixels": int(np.count_nonzero(edges)),
                "wall_count": len(walls),
                "room_count": len(rooms),
                "pipeline": "hybrid-heuristic-ai",
                **ai_metadata,
            },
        )

    def _load_image(self, file_path: Path) -> np.ndarray:
        if file_path.suffix.lower() == ".pdf":
            document = fitz.open(file_path)
            page = document.load_page(0)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
            document.close()
            return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        image = cv2.imread(str(file_path))
        if image is None:
            raise ValueError("Unable to read uploaded floor plan.")
        return image

    def _scale(self, width: int, height: int) -> float:
        longest_side_meters = 18.0
        return longest_side_meters / max(width, height)

    def _normalize(self, point: tuple[int, int], width: int, height: int) -> tuple[float, float]:
        scale = self._scale(width, height)
        x, y = point
        return (round(x * scale, 3), round(y * scale, 3))

    def _detect_walls(self, edges: np.ndarray, width: int, height: int) -> list[Wall]:
        min_line_length = max(32, min(width, height) // 18)
        max_line_gap = max(8, min(width, height) // 80)
        raw_lines = cv2.HoughLinesP(
            edges,
            rho=1,
            theta=np.pi / 180,
            threshold=70,
            minLineLength=min_line_length,
            maxLineGap=max_line_gap,
        )

        if raw_lines is None:
            return self._fallback_outer_walls(width, height)

        candidates: list[tuple[int, int, int, int]] = []
        for line in raw_lines[:, 0]:
            x1, y1, x2, y2 = map(int, line)
            length = math.dist((x1, y1), (x2, y2))
            if length < min_line_length:
                continue

            angle = abs(math.degrees(math.atan2(y2 - y1, x2 - x1))) % 180
            is_axis_aligned = angle < 12 or angle > 168 or abs(angle - 90) < 12
            if is_axis_aligned:
                candidates.append((x1, y1, x2, y2))

        merged = self._merge_similar_lines(candidates)
        walls = [
            Wall(
                start=self._normalize((x1, y1), width, height),
                end=self._normalize((x2, y2), width, height),
                confidence=0.82,
            )
            for x1, y1, x2, y2 in merged[:140]
        ]
        return walls or self._fallback_outer_walls(width, height)

    def _merge_similar_lines(self, lines: list[tuple[int, int, int, int]]) -> list[tuple[int, int, int, int]]:
        horizontal: dict[int, list[tuple[int, int, int, int]]] = {}
        vertical: dict[int, list[tuple[int, int, int, int]]] = {}
        bucket = 10

        for x1, y1, x2, y2 in lines:
            if abs(y2 - y1) <= abs(x2 - x1):
                key = round(((y1 + y2) / 2) / bucket)
                horizontal.setdefault(key, []).append((x1, y1, x2, y2))
            else:
                key = round(((x1 + x2) / 2) / bucket)
                vertical.setdefault(key, []).append((x1, y1, x2, y2))

        merged: list[tuple[int, int, int, int]] = []
        for grouped in horizontal.values():
            xs = [x for line in grouped for x in (line[0], line[2])]
            ys = [y for line in grouped for y in (line[1], line[3])]
            merged.append((min(xs), round(sum(ys) / len(ys)), max(xs), round(sum(ys) / len(ys))))

        for grouped in vertical.values():
            xs = [x for line in grouped for x in (line[0], line[2])]
            ys = [y for line in grouped for y in (line[1], line[3])]
            merged.append((round(sum(xs) / len(xs)), min(ys), round(sum(xs) / len(xs)), max(ys)))

        return sorted(merged, key=lambda line: math.dist((line[0], line[1]), (line[2], line[3])), reverse=True)

    def _detect_rooms(self, threshold: np.ndarray, width: int, height: int) -> list[Room]:
        inverted = cv2.bitwise_not(threshold)
        contours, _ = cv2.findContours(inverted, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        rooms: list[Room] = []
        min_area = width * height * 0.01
        max_area = width * height * 0.75

        for contour in contours:
            area_px = cv2.contourArea(contour)
            if area_px < min_area or area_px > max_area:
                continue

            epsilon = 0.015 * cv2.arcLength(contour, True)
            polygon = cv2.approxPolyDP(contour, epsilon, True)
            points = [self._normalize((int(point[0][0]), int(point[0][1])), width, height) for point in polygon]
            if len(points) < 4:
                x, y, w, h = cv2.boundingRect(contour)
                points = [
                    self._normalize((x, y), width, height),
                    self._normalize((x + w, y), width, height),
                    self._normalize((x + w, y + h), width, height),
                    self._normalize((x, y + h), width, height),
                ]

            area = round(area_px * (self._scale(width, height) ** 2), 2)
            rooms.append(
                Room(
                    id=f"room_{uuid4().hex[:8]}",
                    label=self._label_room(area),
                    polygon=points[:12],
                    area=area,
                    confidence=0.58,
                )
            )

        if rooms:
            return sorted(rooms, key=lambda room: room.area, reverse=True)[:24]

        scale = self._scale(width, height)
        return [
            Room(
                id="room_fallback",
                label="Open Plan",
                polygon=[(0, 0), (round(width * scale, 3), 0), (round(width * scale, 3), round(height * scale, 3)), (0, round(height * scale, 3))],
                area=round(width * height * scale * scale, 2),
                confidence=0.35,
            )
        ]

    def _label_room(self, area: float) -> str:
        if area > 35:
            return "Living Zone"
        if area > 18:
            return "Bedroom"
        if area > 9:
            return "Kitchen"
        return "Bath / Utility"

    def _detect_openings(self, walls: list[Wall], rooms: list[Room]) -> tuple[list[Opening], list[Opening]]:
        doors: list[Opening] = []
        windows: list[Opening] = []
        for index, wall in enumerate(walls[:10]):
            sx, sy = wall.start
            ex, ey = wall.end
            length = math.dist(wall.start, wall.end)
            if length < 2.0:
                continue
            center = (round(sx + (ex - sx) * 0.5, 3), round(sy + (ey - sy) * 0.5, 3))
            if index % 3 == 0 and rooms:
                doors.append(
                    Opening(
                        id=f"door_{index}",
                        type="door",
                        center=center,
                        width=min(0.95, length * 0.25),
                        wall_index=index,
                        confidence=0.34,
                    )
                )
            elif index % 2 == 0:
                windows.append(
                    Opening(
                        id=f"window_{index}",
                        type="window",
                        center=center,
                        width=min(1.5, length * 0.3),
                        wall_index=index,
                        confidence=0.31,
                    )
                )
        return doors[:8], windows[:10]

    def _fallback_outer_walls(self, width: int, height: int) -> list[Wall]:
        scale = self._scale(width, height)
        w = round(width * scale, 3)
        h = round(height * scale, 3)
        return [
            Wall(start=(0, 0), end=(w, 0), confidence=0.3),
            Wall(start=(w, 0), end=(w, h), confidence=0.3),
            Wall(start=(w, h), end=(0, h), confidence=0.3),
            Wall(start=(0, h), end=(0, 0), confidence=0.3),
        ]
