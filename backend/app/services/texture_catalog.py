from __future__ import annotations

from app.models.schemas import TexturePreset


class TextureCatalog:
    """Central catalog for frontend material controls and future PBR assets."""

    def list_presets(self) -> list[TexturePreset]:
        return [
            TexturePreset(
                id="wood",
                label="Warm Oak",
                category="floor",
                color="#A8763E",
                roughness=0.46,
                description="Warm wood floor preset for living rooms and bedrooms.",
            ),
            TexturePreset(
                id="marble",
                label="White Marble",
                category="floor",
                color="#E7EDF4",
                roughness=0.28,
                description="Bright marble-like floor preset for premium interiors.",
            ),
            TexturePreset(
                id="tiles",
                label="Ceramic Tile",
                category="floor",
                color="#9AB8C2",
                roughness=0.38,
                description="Cool tile preset for kitchens, bathrooms, and halls.",
            ),
            TexturePreset(
                id="concrete",
                label="Soft Concrete",
                category="floor",
                color="#737B82",
                roughness=0.72,
                description="Neutral concrete preset for modern studio plans.",
            ),
            TexturePreset(
                id="paint",
                label="Matte Paint",
                category="floor",
                color="#C7F9CC",
                roughness=0.84,
                description="Soft matte painted surface for walls and accents.",
            ),
        ]
