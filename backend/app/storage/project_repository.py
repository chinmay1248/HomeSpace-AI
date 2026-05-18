from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Iterable

from app.core.config import Settings
from app.models.schemas import Project


class ProjectRepository:
    def list(self) -> list[Project]:
        raise NotImplementedError

    def get(self, project_id: str) -> Project | None:
        raise NotImplementedError

    def save(self, project: Project) -> Project:
        raise NotImplementedError

    def delete(self, project_id: str) -> bool:
        raise NotImplementedError


class JsonProjectRepository(ProjectRepository):
    def __init__(self, settings: Settings):
        self.path = settings.data_path / "projects.json"
        self.lock = Lock()
        if not self.path.exists():
            self.path.write_text("[]", encoding="utf-8")

    def _read(self) -> list[Project]:
        raw = json.loads(self.path.read_text(encoding="utf-8") or "[]")
        return [Project.model_validate(item) for item in raw]

    def _write(self, projects: Iterable[Project]) -> None:
        payload = [project.model_dump(mode="json") for project in projects]
        self.path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def list(self) -> list[Project]:
        with self.lock:
            return sorted(self._read(), key=lambda item: item.updated_at, reverse=True)

    def get(self, project_id: str) -> Project | None:
        with self.lock:
            return next((project for project in self._read() if project.id == project_id), None)

    def save(self, project: Project) -> Project:
        with self.lock:
            project.updated_at = datetime.utcnow()
            projects = [item for item in self._read() if item.id != project.id]
            projects.append(project)
            self._write(projects)
        return project

    def delete(self, project_id: str) -> bool:
        with self.lock:
            projects = self._read()
            next_projects = [item for item in projects if item.id != project_id]
            self._write(next_projects)
            return len(next_projects) != len(projects)


class MongoProjectRepository(ProjectRepository):
    def __init__(self, settings: Settings):
        from pymongo import MongoClient

        if not settings.mongodb_uri:
            raise ValueError("MongoDB URI is required for MongoProjectRepository.")
        self.client = MongoClient(settings.mongodb_uri)
        self.collection = self.client[settings.mongodb_database]["projects"]

    def list(self) -> list[Project]:
        documents = self.collection.find().sort("updated_at", -1)
        return [Project.model_validate(self._from_document(document)) for document in documents]

    def get(self, project_id: str) -> Project | None:
        document = self.collection.find_one({"id": project_id})
        return Project.model_validate(self._from_document(document)) if document else None

    def save(self, project: Project) -> Project:
        project.updated_at = datetime.utcnow()
        payload = project.model_dump(mode="json")
        self.collection.update_one({"id": project.id}, {"$set": payload}, upsert=True)
        return project

    def delete(self, project_id: str) -> bool:
        result = self.collection.delete_one({"id": project_id})
        return result.deleted_count > 0

    def _from_document(self, document: dict) -> dict:
        document.pop("_id", None)
        return document


def create_repository(settings: Settings) -> ProjectRepository:
    if settings.mongodb_uri:
        return MongoProjectRepository(settings)
    return JsonProjectRepository(settings)
