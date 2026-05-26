from fastapi import APIRouter

router = APIRouter()

_startup_error: str | None = None


def set_startup_error(err: str) -> None:
    global _startup_error
    _startup_error = err


@router.get("/health")
async def health():
    resp: dict = {"status": "ok", "version": "1.0.3"}
    if _startup_error:
        resp["startup_error"] = _startup_error
    return resp
