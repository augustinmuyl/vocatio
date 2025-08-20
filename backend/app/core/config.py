from pydantic import EmailStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    database_echo: bool = False
    postmark_api_token: str | None = None
    postmark_from_email: EmailStr | None = None

    class Config:
        env_file = ".env"


settings = Settings()  # type: ignore[call-arg]
