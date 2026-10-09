import logging
import os
import time
from pathlib import Path
from collections import defaultdict, deque

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from . import chatbot
from .schemas import ChatIn, ChatOut, ContactIn
from .storage import DATA_DIR, Repository, get_repo

log = logging.getLogger("uvicorn.error")  # shows up in the host's Logs tab
app = FastAPI(title="Portfolio API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# --- tiny in-memory rate limiter (per IP) -------------------------------------
_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(max_calls: int, per_seconds: int):
    def dep(request: Request):
        ip = request.client.host if request.client else "unknown"
        key = f"{request.url.path}:{ip}"
        now = time.time()
        q = _hits[key]
        while q and now - q[0] > per_seconds:
            q.popleft()
        if len(q) >= max_calls:
            raise HTTPException(429, "Too many requests, please slow down.")
        q.append(now)

    return dep


# --- routes -------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/profile")
def profile(repo: Repository = Depends(get_repo)):
    return repo.get_profile()


@app.get("/api/projects")
def projects(repo: Repository = Depends(get_repo)):
    return repo.list_projects()


@app.get("/api/projects/{slug}")
def project(slug: str, repo: Repository = Depends(get_repo)):
    item = repo.get_project(slug)
    if not item:
        raise HTTPException(404, "Project not found")
    return item


@app.get("/api/posts")
def posts(repo: Repository = Depends(get_repo)):
    return [{k: v for k, v in p.items() if k != "content"} for p in repo.list_posts()]


@app.get("/api/posts/{slug}")
def post(slug: str, repo: Repository = Depends(get_repo)):
    item = repo.get_post(slug)
    if not item:
        raise HTTPException(404, "Post not found")
    return item


@app.get("/api/resume")
def resume():
    path = DATA_DIR / "resume.pdf"
    if not path.exists():
        raise HTTPException(404, "Resume not uploaded yet. Put resume.pdf in backend/data/")
    return FileResponse(path, media_type="application/pdf", filename="Arpita_Resume.pdf")


@app.post("/api/contact", status_code=201, dependencies=[Depends(rate_limit(5, 3600))])
def contact(body: ContactIn, repo: Repository = Depends(get_repo)):
    if body.website:  # honeypot tripped: pretend success, store nothing
        return {"ok": True}
    repo.save_message(body.name.strip(), body.email.strip(), body.message.strip())
    # Free hosts wipe files on restart, so also write the message to the logs.
    log.info("NEW CONTACT MESSAGE from %s <%s>: %s", body.name.strip(), body.email.strip(), body.message.strip())
    return {"ok": True}


@app.post("/api/chat", response_model=ChatOut, dependencies=[Depends(rate_limit(30, 600))])
def chat(body: ChatIn, repo: Repository = Depends(get_repo)):
    return chatbot.answer(body.message, repo)


# --- serve the built website (so only Python is needed to run everything) ------
WEB_DIR = Path(__file__).resolve().parent.parent / "web"

if WEB_DIR.is_dir():

    @app.get("/{full_path:path}", include_in_schema=False)
    def website(full_path: str):
        # Unknown /api/... URLs must stay real 404s, not the web page.
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(404, "Not found")
        candidate = (WEB_DIR / full_path).resolve()
        if candidate.is_file() and WEB_DIR.resolve() in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(WEB_DIR / "index.html")  # Angular handles the route
