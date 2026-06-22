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


def test_projects_endpoint_returns_list():
    client = TestClient(app)
    response = client.get("/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_upload_invalid_file_type():
    client = TestClient(app)
    # Simulate an invalid file upload
    response = client.post(
        "/upload",
        files={"file": ("test.txt", b"invalid content", "text/plain")}
    )
    assert response.status_code == 415
    assert "Only JPG, PNG, and PDF floor plans are supported" in response.json()["detail"]


def test_delete_non_existent_project():
    client = TestClient(app)
    response = client.delete("/projects/invalid-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found."


def test_ai_wrappers_are_disabled_without_model_paths():
    assert YOLOOpeningDetector().enabled is False
    assert UNetRoomSegmenter().enabled is False
