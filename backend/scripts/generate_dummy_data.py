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
