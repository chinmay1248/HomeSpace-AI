from fastapi.testclient import TestClient

from app.ai.opening_detector import YOLOOpeningDetector
from app.ai.room_segmenter import UNetRoomSegmenter
from app.main import app


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_textures_endpoint_returns_material_catalog():
    client = TestClient(app)
    response = client.get("/textures")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 5
    assert {"wood", "marble", "tiles", "concrete", "paint"}.issubset({item["id"] for item in payload})


def test_ai_wrappers_are_disabled_without_model_paths():
    assert YOLOOpeningDetector().enabled is False
    assert UNetRoomSegmenter().enabled is False
