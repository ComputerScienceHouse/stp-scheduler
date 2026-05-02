"""Application entrypoint for `fastapi run app.py` (working directory: backend/)."""

from stp_scheduler.api.app import app

__all__ = ["app"]
