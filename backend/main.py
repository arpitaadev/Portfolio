"""Entry point for hosts that auto-detect `main:app` (e.g. SnapDeploy).

The real application lives in app/main.py; this file just re-exports it.
"""
from app.main import app  # noqa: F401
