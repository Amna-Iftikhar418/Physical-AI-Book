import os

from fastapi import APIRouter

router = APIRouter()

_startup_error: str | None = None
_cors_origins: list[str] = []


def set_startup_error(err: str) -> None:
    global _startup_error
    _startup_error = err


def set_cors_origins(origins: list[str]) -> None:
    global _cors_origins
    _cors_origins = origins


@router.get("/health")
async def health():
    resp: dict = {
        "status": "ok",
        "version": "1.0.8",
        "git_sha": os.environ.get("RAILWAY_GIT_COMMIT_SHA", "local")[:8],
        "cors_origins": _cors_origins,
    }
    if _startup_error:
        resp["startup_error"] = _startup_error
    return resp
