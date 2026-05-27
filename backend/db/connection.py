import re
import ssl

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import DATABASE_URL

# Convert to asyncpg scheme
_async_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# asyncpg doesn't accept sslmode/channel_binding as URL query params —
# strip them and pass ssl via connect_args instead.
_needs_ssl = bool(re.search(r"sslmode=require", _async_url))
_async_url = re.sub(r"[?&](sslmode|channel_binding)=[^&]*", "", _async_url).rstrip("?&")

_connect_args: dict = {}
if _needs_ssl:
    _ssl_ctx = ssl.create_default_context()
    _connect_args["ssl"] = _ssl_ctx

engine = create_async_engine(
    _async_url,
    pool_size=5,
    max_overflow=0,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
