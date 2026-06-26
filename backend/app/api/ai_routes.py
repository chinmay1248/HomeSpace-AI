from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

from app.models.schemas import MaterialSettings, Project
from app.storage.project_repository import ProjectRepository
from app.api.routes import get_repository

router = APIRouter(prefix="/ai", tags=["AI Decorator"])

class RedecorateRequest(BaseModel):
    project_id: str
    style: str

class ColorPalette(BaseModel):
    name: str
    wall_color: str
    floor_color: str

# Mock AI styling data
STYLE_PRESETS = {
    "Modern Minimalist": MaterialSettings(
        wall_color="#F3F4F6", # Light gray
        floor_texture="wood_light",
        sunlight_intensity=1.2,
        sunlight_color="#FFFFFF"
    ),
    "Scandinavian": MaterialSettings(
        wall_color="#FFFFFF",
        floor_texture="wood_light",
        sunlight_intensity=1.1,
        sunlight_color="#FFF8E7"
    ),
    "Industrial": MaterialSettings(
        wall_color="#374151", # Dark gray/concrete vibe
        floor_texture="concrete",
        sunlight_intensity=0.9,
        sunlight_color="#FCA5A5" # Warm, slightly reddish light
    ),
    "Bohemian": MaterialSettings(
        wall_color="#FEF3C7", # Warm beige
        floor_texture="wood_dark",
        sunlight_intensity=1.0,
        sunlight_color="#FDE047" # Bright sun
    ),
    "Cyberpunk": MaterialSettings(
        wall_color="#111827", # Very dark
        floor_texture="tiles",
        sunlight_intensity=0.5,
        sunlight_color="#C084FC" # Purple/Neon vibe
    )
}

PALETTES = [
    ColorPalette(name="Calm Ocean", wall_color="#E0F2FE", floor_color="#0369A1"),
    ColorPalette(name="Forest Retreat", wall_color="#DCFCE7", floor_color="#166534"),
    ColorPalette(name="Sunset Glow", wall_color="#FFEDD5", floor_color="#9A3412"),
    ColorPalette(name="Urban Slate", wall_color="#F1F5F9", floor_color="#334155"),
]

@router.post("/redecorate", response_model=Project, summary="AI Redecorate")
def ai_redecorate(
    payload: RedecorateRequest,
    repository: ProjectRepository = Depends(get_repository),
) -> Project:
    project = repository.get(payload.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    # Auto-apply style based on the selected prompt/style
    style_materials = STYLE_PRESETS.get(payload.style)
    if not style_materials:
        # Fallback to default if style not found
        style_materials = STYLE_PRESETS["Modern Minimalist"]
    
    project.materials = style_materials
    
    # If layout exists, regenerate scene
    if project.layout:
        from app.services.scene_generator import SceneGenerator
        project.scene = SceneGenerator().generate(project.layout, project.materials)
        
    return repository.save(project)

@router.get("/palettes", response_model=List[ColorPalette], summary="Get AI Color Palettes")
def get_palettes() -> List[ColorPalette]:
    return PALETTES
