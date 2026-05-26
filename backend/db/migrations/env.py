import os
from logging.config import fileConfig
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool
from alembic import context

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = None


def _sync_db_url() -> str:
    """Convert asyncpg DATABASE_URL to a psycopg2-compatible sync URL."""
    raw = os.environ["DATABASE_URL"]
    url = raw.replace("postgresql://", "postgresql+psycopg2://", 1)
    # psycopg2 doesn't support channel_binding — strip it
    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    params.pop("channel_binding", None)
    new_query = urlencode({k: v[0] for k, v in params.items()})
    return urlunparse(parsed._replace(query=new_query))


def run_migrations_offline() -> None:
    url = _sync_db_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = _sync_db_url()
    connectable = engine_from_config(cfg, prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
