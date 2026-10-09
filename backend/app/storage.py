"""Storage layer.

Today: JSON files in ./data. Later: SQLAlchemy.

The API only talks to the `Repository` interface below, so moving to a database means
writing a `SqlRepository` with the same methods and changing one line in `get_repo()`.
"""
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol

DATA_DIR = Path(os.getenv("PORTFOLIO_DATA_DIR", Path(__file__).resolve().parent.parent / "data"))


class Repository(Protocol):
    def get_profile(self) -> dict: ...
    def list_projects(self) -> list[dict]: ...
    def get_project(self, slug: str) -> dict | None: ...
    def list_posts(self) -> list[dict]: ...
    def get_post(self, slug: str) -> dict | None: ...
    def save_message(self, name: str, email: str, message: str) -> dict: ...


class JsonRepository:
    def __init__(self, data_dir: Path = DATA_DIR):
        self.dir = Path(data_dir)
        self._lock = threading.Lock()

    def _read(self, name: str) -> Any:
        with open(self.dir / f"{name}.json", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, name: str, data: Any) -> None:
        tmp = self.dir / f"{name}.json.tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        tmp.replace(self.dir / f"{name}.json")

    def get_profile(self) -> dict:
        return self._read("profile")

    def list_projects(self) -> list[dict]:
        return self._read("projects")

    def get_project(self, slug: str) -> dict | None:
        return next((p for p in self.list_projects() if p["slug"] == slug), None)

    def list_posts(self) -> list[dict]:
        return sorted(self._read("posts"), key=lambda p: p["date"], reverse=True)

    def get_post(self, slug: str) -> dict | None:
        return next((p for p in self.list_posts() if p["slug"] == slug), None)

    def save_message(self, name: str, email: str, message: str) -> dict:
        entry = {
            "name": name,
            "email": email,
            "message": message,
            "received_at": datetime.now(timezone.utc).isoformat(),
        }
        with self._lock:
            try:
                items = self._read("messages")
            except FileNotFoundError:  # fresh clone: inbox file is created on first message
                items = []
            items.append(entry)
            self._write("messages", items)
        return entry


def get_repo() -> Repository:
    return JsonRepository()
