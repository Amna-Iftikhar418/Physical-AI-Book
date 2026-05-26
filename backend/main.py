from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from routers.health import router as health_router, set_startup_error

_chat_err: str | None = None
try:
    from routers.chat import router as chat_router
except Exception as exc:
    import traceback
    _chat_err = traceback.format_exc()
    chat_router = None  # type: ignore[assignment]

if _chat_err:
    set_startup_error(_chat_err)

app = FastAPI(title="Physical AI Textbook API", version="1.0.2")

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
