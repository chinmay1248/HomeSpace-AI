from datetime import datetime
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


Point2D = tuple[float, float]


class Wall(BaseModel):
    start: Point2D
    end: Point2D
    thickness: float = 0.18
    confidence: float = Field(default=0.75, ge=0, le=1)


class Room(BaseModel):
    id: str
    label: str = "Room"
    polygon: list[Point2D]
    area: float
    confidence: float = Field(default=0.6, ge=0, le=1)


class Opening(BaseModel):
    id: str
    type: Literal["door", "window", "bed", "toilet", "sink", "stove", "dining_table"]
    center: Point2D
    width: float
    wall_index: int | None = None
    confidence: float = Field(default=0.45, ge=0, le=1)


class TextLabel(BaseModel):
    text: str
    bbox: list[Point2D]
    confidence: float = Field(default=1.0, ge=0, le=1)


class LayoutAnalysis(BaseModel):
    units: str = "meters"
    source_size: tuple[int, int]
    scale: float
    walls: list[Wall]
    rooms: list[Room]
    doors: list[Opening] = []
    windows: list[Opening] = []
    text_labels: list[TextLabel] = []
    metadata: dict[str, Any] = Field(default_factory=dict)


class MaterialSettings(BaseModel):
    wall_color: str = "#E8F3FF"
    floor_texture: str = "wood"
    ceiling_color: str = "#F8FBFF"
    theme: str = "aurora"
    sunlight: bool = True


class TexturePreset(BaseModel):
    id: str
    label: str
    category: Literal["floor", "wall", "ceiling"]
    color: str
    roughness: float = Field(default=0.55, ge=0, le=1)
    metalness: float = Field(default=0.02, ge=0, le=1)
    description: str


class ProjectStatus(str, Enum):
    uploaded = "uploaded"
    analyzed = "analyzed"
    generated = "generated"
    failed = "failed"


class Project(BaseModel):
    id: str
    name: str
    status: ProjectStatus
    filename: str
    content_type: str
    file_path: str
    preview_url: str | None = None
    layout: LayoutAnalysis | None = None
    scene: dict[str, Any] | None = None
    materials: MaterialSettings = Field(default_factory=MaterialSettings)
    error: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UploadResponse(BaseModel):
    project: Project


class AnalyzeRequest(BaseModel):
    project_id: str


class Generate3DRequest(BaseModel):
    project_id: str


class MaterialUpdateRequest(BaseModel):
    project_id: str
    materials: MaterialSettings
