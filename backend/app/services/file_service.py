from __future__ import annotations

import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings


ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
}


class FileService:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def save_upload(self, file: UploadFile) -> tuple[str, Path]:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only JPG, PNG, and PDF floor plans are supported.",
            )

        suffix = ALLOWED_TYPES[file.content_type]
        safe_name = f"{uuid4().hex}{suffix}"
        destination = self.settings.upload_path / safe_name
        max_bytes = self.settings.max_upload_mb * 1024 * 1024

        size = 0
        with destination.open("wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Upload exceeds {self.settings.max_upload_mb} MB.",
                    )
                buffer.write(chunk)

        return safe_name, destination

