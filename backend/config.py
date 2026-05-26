import os
from dotenv import load_dotenv

load_dotenv()

_REQUIRED = [
    "GOOGLE_API_KEY",
    "QDRANT_URL",
    "QDRANT_API_KEY",
    "DATABASE_URL",
]

# Collect (not raise) so importing config never crashes startup.
# main.py surfaces MISSING_VARS via /health instead of letting the
# app crash-loop, which causes Railway to silently keep the old build.
MISSING_VARS: list[str] = [k for k in _REQUIRED if not os.getenv(k)]

GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
QDRANT_URL: str = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
DATABASE_URL: str = os.getenv("DATABASE_URL", "")
BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
BETTER_AUTH_BASE_URL: str = os.getenv("BETTER_AUTH_BASE_URL", "http://localhost:3000")
CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
