from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"},
)


def get_session():
    with Session(engine) as session:
        yield session
