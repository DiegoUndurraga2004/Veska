from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    environment: str = "development"

    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    database_url: str = ""

    runpod_api_key: str = ""
    runpod_endpoint_id: str = ""

    jwt_secret: str = "development-only-change-me"

    max_file_size_mb: int = 25
    max_question_length: int = 4000
    max_chunks_per_query: int = 8

    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()