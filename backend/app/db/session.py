from sqlalchemy.pool import StaticPool
from sqlmodel import Session, create_engine

from app.core.config import settings

# Default connection args for Postgres
connect_args = {"sslmode": "require"}
engine_kwargs = {"pool_pre_ping": True, "connect_args": connect_args}

# Adjust for SQLite databases
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs["connect_args"] = connect_args
    if settings.database_url in ("sqlite://", "sqlite:///:memory:"):
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    **engine_kwargs,
)


def get_session():
    with Session(engine) as session:
        yield session
