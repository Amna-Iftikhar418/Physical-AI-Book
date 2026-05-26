import os
from dotenv import load_dotenv

load_dotenv()

_REQUIRED = [
    "GOOGLE_API_KEY",
    "QDRANT_URL",
    "QDRANT_API_KEY",
    "DATABASE_URL",
]

for _key in _REQUIRED:
    if not os.getenv(_key):
        raise EnvironmentError(f"Missing required environment variable: {_key}")

GOOGLE_API_KEY: str = os.environ["GOOGLE_API_KEY"]
QDRANT_URL: str = os.environ["QDRANT_URL"]
QDRANT_API_KEY: str = os.environ["QDRANT_API_KEY"]
DATABASE_URL: str = os.environ["DATABASE_URL"]
BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
BETTER_AUTH_BASE_URL: str = os.getenv("BETTER_AUTH_BASE_URL", "http://localhost:3000")
CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
