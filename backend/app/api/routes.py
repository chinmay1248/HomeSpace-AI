from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.core.config import Settings, get_settings
from app.models.schemas import (
    AnalyzeRequest,
    Generate3DRequest,
    MaterialUpdateRequest,
    Project,
    ProjectStatus,
    TexturePreset,
    UploadResponse,
)
from app.services.file_service import FileService
from app.services.floorplan_analyzer import FloorPlanAnalyzer
from app.services.scene_generator import SceneGenerator
from app.services.texture_catalog import TextureCatalog
from app.storage.project_repository import ProjectRepository, create_repository

router = APIRouter()
_repository: ProjectRepository | None = None


def get_repository(settings: Settings = Depends(get_settings)) -> ProjectRepository:
    global _repository
    if _repository is None:
        _repository = create_repository(settings)
    return _repository


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "MetaNest API"}


@router.post("/upload", response_model=UploadResponse)
async def upload_floor_plan(
    file: UploadFile,
    settings: Settings = Depends(get_settings),
    repository: ProjectRepository = Depends(get_repository),
) -> UploadResponse:
    service = FileService(settings)
    stored_name, destination = await service.save_upload(file)
    project = Project(
        id=uuid4().hex,
        name=Path(file.filename or stored_name).stem or "Untitled floor plan",
        status=ProjectStatus.uploaded,
        filename=file.filename or stored_name,
        content_type=file.content_type or "application/octet-stream",
        file_path=str(destination),
        preview_url=f"/uploads/{stored_name}",
    )
    repository.save(project)
    return UploadResponse(project=project)


@router.post("/analyze", response_model=Project)
def analyze_floor_plan(
    payload: AnalyzeRequest,
    settings: Settings = Depends(get_settings),
    repository: ProjectRepository = Depends(get_repository),
) -> Project:
    project = _get_project_or_404(repository, payload.project_id)
    analyzer = FloorPlanAnalyzer(settings.yolo_opening_model_path, settings.unet_room_model_path)
    try:
        project.layout = analyzer.analyze(Path(project.file_path))
        project.status = ProjectStatus.analyzed
        project.error = None
    except Exception as exc:
        project.status = ProjectStatus.failed
        project.error = str(exc)
        repository.save(project)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return repository.save(project)


@router.post("/generate3d", response_model=Project)
def generate_3d(
    payload: Generate3DRequest,
    repository: ProjectRepository = Depends(get_repository),
) -> Project:
    project = _get_project_or_404(repository, payload.project_id)
    if project.layout is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Analyze the project before generating 3D.")

    generator = SceneGenerator()
    project.scene = generator.generate(project.layout, project.materials)
    project.status = ProjectStatus.generated
    project.error = None
    return repository.save(project)


@router.get("/projects", response_model=list[Project])
def list_projects(repository: ProjectRepository = Depends(get_repository)) -> list[Project]:
    return repository.list()


@router.get("/textures", response_model=list[TexturePreset])
def list_textures() -> list[TexturePreset]:
    return TextureCatalog().list_presets()


@router.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str, repository: ProjectRepository = Depends(get_repository)) -> Project:
    return _get_project_or_404(repository, project_id)


@router.patch("/projects/{project_id}/materials", response_model=Project)
def update_materials(
    project_id: str,
    payload: MaterialUpdateRequest,
    repository: ProjectRepository = Depends(get_repository),
) -> Project:
    if payload.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project ID mismatch.")
    project = _get_project_or_404(repository, project_id)
    project.materials = payload.materials
    if project.layout:
        project.scene = SceneGenerator().generate(project.layout, project.materials)
        project.status = ProjectStatus.generated
    return repository.save(project)


def _get_project_or_404(repository: ProjectRepository, project_id: str) -> Project:
    project = repository.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project
