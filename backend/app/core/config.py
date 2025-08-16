from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    database_echo: bool = False

    class Config:
        env_file = ".env"


settings = Settings()  # type: ignore[call-arg]
