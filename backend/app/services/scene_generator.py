from __future__ import annotations

from app.models.schemas import LayoutAnalysis, MaterialSettings


class SceneGenerator:
    """Generates the interactive 3D scene payload from analyzed 2D layouts."""

    def generate(self, layout: LayoutAnalysis, materials: MaterialSettings) -> dict:
        """
        Convert a 2D LayoutAnalysis into a ScenePayload format consumed by the React Three Fiber frontend.
        
        Args:
            layout: The structured 2D layout geometry.
            materials: User-defined material preferences for walls, floors, and lighting.
            
        Returns:
            dict: The complete scene definition including bounds and camera features.
        """
        bounds = self._bounds(layout)
        return {
            "version": "1.0",
            "units": layout.units,
            "bounds": bounds,
            "wallHeight": 3.0,
            "wallThickness": 0.18,
            "walls": [wall.model_dump() for wall in layout.walls],
            "rooms": [room.model_dump() for room in layout.rooms],
            "doors": [door.model_dump() for door in layout.doors],
            "windows": [window.model_dump() for window in layout.windows],
            "materials": materials.model_dump(),
            "features": {
                "orbit": True,
                "firstPerson": True,
                "collision": True,
                "sunlight": materials.sunlight,
                "exportReady": True,
            },
        }

    def _bounds(self, layout: LayoutAnalysis) -> dict:
        points = [point for wall in layout.walls for point in (wall.start, wall.end)]
        for room in layout.rooms:
            points.extend(room.polygon)
        if not points:
            return {"min": [0, 0], "max": [12, 12], "center": [6, 6]}

        xs = [point[0] for point in points]
        ys = [point[1] for point in points]
        return {
            "min": [min(xs), min(ys)],
            "max": [max(xs), max(ys)],
            "center": [round((min(xs) + max(xs)) / 2, 3), round((min(ys) + max(ys)) / 2, 3)],
        }

