import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers.health import router as health_router, set_startup_error, set_cors_origins

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
    import db.models  # noqa: F401 — registers models on Base.metadata
    from db.connection import engine, Base
    for attempt in range(3):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("DB tables created/verified OK")
            break
        except Exception:
            import traceback
            print(f"DB init attempt {attempt + 1}/3 failed:", traceback.format_exc())
            if attempt < 2:
                await asyncio.sleep(3)
    print("CORS ORIGINS:", CORS_ORIGINS)
    set_cors_origins(CORS_ORIGINS)
    routes = [f"{m} {r.path}" for r in app.routes for m in getattr(r, "methods", [])]
    print("REGISTERED ROUTES:", routes)
    yield


app = FastAPI(title="Physical AI Textbook API", version="1.0.7", lifespan=lifespan)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    import traceback
    print("UNHANDLED EXCEPTION:", traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
    )


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
