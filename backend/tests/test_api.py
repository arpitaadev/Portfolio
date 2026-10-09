import json
import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main
from app.storage import JsonRepository

DATA = Path(__file__).resolve().parent.parent / "data"


@pytest.fixture()
def client(tmp_path):
    shutil.copytree(DATA, tmp_path / "data")
    (tmp_path / "data" / "messages.json").write_text("[]")  # tests always start with an empty inbox
    repo = JsonRepository(tmp_path / "data")
    main.app.dependency_overrides[main.get_repo] = lambda: repo
    main._hits.clear()
    yield TestClient(main.app), repo
    main.app.dependency_overrides.clear()


def test_health(client):
    c, _ = client
    assert c.get("/api/health").json() == {"status": "ok"}


def test_profile_projects_posts(client):
    c, _ = client
    assert c.get("/api/profile").json()["title"] == "AI Developer"
    slugs = [p["slug"] for p in c.get("/api/projects").json()]
    assert "ai-agent" in slugs
    assert c.get("/api/projects/ai-agent").status_code == 200
    assert c.get("/api/projects/nope").status_code == 404
    listing = c.get("/api/posts").json()
    assert listing and "content" not in listing[0]
    assert c.get(f"/api/posts/{listing[0]['slug']}").json()["content"]


def test_contact_saves_and_validates(client):
    c, repo = client
    ok = {"name": "Recruiter", "email": "hr@example.com", "message": "We'd love to talk about a role."}
    assert c.post("/api/contact", json=ok).status_code == 201
    assert len(json.loads((repo.dir / "messages.json").read_text())) == 1
    assert c.post("/api/contact", json={**ok, "email": "bad"}).status_code == 422
    # honeypot: accepted silently but nothing stored
    assert c.post("/api/contact", json={**ok, "website": "spam.com"}).status_code == 201
    assert len(json.loads((repo.dir / "messages.json").read_text())) == 1


def test_contact_rate_limit(client):
    c, _ = client
    body = {"name": "Test", "email": "a@b.co", "message": "A long enough message."}
    codes = [c.post("/api/contact", json=body).status_code for _ in range(6)]
    assert codes[:5] == [201] * 5 and codes[5] == 429


def test_chatbot(client):
    c, _ = client
    r = c.post("/api/chat", json={"message": "What is the pomegranate research about?"}).json()
    assert "pomegranate" in r["answer"].lower() and r["sources"]
    assert "assistant" in c.post("/api/chat", json={"message": "hi"}).json()["answer"].lower()
    miss = c.post("/api/chat", json={"message": "quantum banana"}).json()
    assert miss["sources"] == []
