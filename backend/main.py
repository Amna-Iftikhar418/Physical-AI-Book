from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.health import router as health_router, set_startup_error

_startup_err: str | None = None
chat_router = None  # type: ignore[assignment]

try:
    from config import CORS_ORIGINS, MISSING_VARS
except Exception:
    import traceback
    _startup_err = traceback.format_exc()
    CORS_ORIGINS = ["*"]
    MISSING_VARS = []

if not _startup_err and MISSING_VARS:
    _startup_err = "Missing required environment variables: " + ", ".join(MISSING_VARS)

auth_router = None  # type: ignore[assignment]

if not _startup_err:
    try:
        from routers.chat import router as chat_router  # type: ignore[assignment]
    except Exception:
        import traceback
        _startup_err = traceback.format_exc()
        chat_router = None  # type: ignore[assignment]

try:
    from routers.auth import router as auth_router  # type: ignore[assignment]
    print("AUTH ROUTER LOADED OK")
except Exception:
    import traceback
    print("AUTH ROUTER LOAD ERROR:", traceback.format_exc())
    auth_router = None  # type: ignore[assignment]

# if _startup_err:
#     set_startup_error(_startup_err)
if _startup_err:
    print("STARTUP ERROR:", _startup_err)
    set_startup_error(_startup_err)


@asynccontextmanager
async def lifespan(app: FastAPI):
    routes = [f"{m} {r.path}" for r in app.routes for m in getattr(r, "methods", [])]
    print("REGISTERED ROUTES:", routes)
    yield


app = FastAPI(title="Physical AI Textbook API", version="1.0.5", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
if chat_router is not None:
    app.include_router(chat_router)
if auth_router is not None:
    app.include_router(auth_router)
