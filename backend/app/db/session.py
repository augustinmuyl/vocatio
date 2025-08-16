from sqlmodel import Session, create_engine

from app.core.config import settings

connect_args = {"sslmode": "require"}
if settings.database_url.startswith("sqlite"):
    connect_args = {}

engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
    connect_args=connect_args,
)


def get_session():
    with Session(engine) as session:
        yield session
