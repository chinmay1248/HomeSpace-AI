import logging
from typing import Any, Dict, List, Optional
import numpy as np

logger = logging.getLogger(__name__)

class OCRReader:
    def __init__(self, use_gpu: bool = False):
        self.reader = None
        self.use_gpu = use_gpu
        self._initialize()

    def _initialize(self) -> None:
        try:
            import easyocr
            # Initialize for English
            self.reader = easyocr.Reader(['en'], gpu=self.use_gpu)
            logger.info("EasyOCR initialized successfully.")
        except ImportError:
            logger.warning("easyocr is not installed. OCR capabilities will be disabled. Install with requirements-ai.txt.")
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {e}")

    def extract_text(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Extract text from an image.
        Returns a list of dictionaries containing the bounding box, text, and confidence score.
        """
        if self.reader is None:
            return []

        try:
            # easyocr expects BGR numpy array or file path. OpenCV reads as BGR.
            # However, if it's grayscale, it handles it as well.
            results = self.reader.readtext(image)
            
            extracted = []
            for bbox, text, prob in results:
                # bbox is a list of 4 points: [top-left, top-right, bottom-right, bottom-left]
                # Convert numpy types to native Python types for JSON serialization
                points = [[float(pt[0]), float(pt[1])] for pt in bbox]
                extracted.append({
                    "bbox": points,
                    "text": text,
                    "confidence": float(prob)
                })
            return extracted
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return []

# Singleton instance for easy importing
ocr_reader = OCRReader()
