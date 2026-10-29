from functools import lru_cache
from pathlib import Path
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str = "development"
    database_url: str = "sqlite:///./cryptova.db"
    supabase_db_url: str = Field(default="", validation_alias=AliasChoices("SUPABASE_DB_URL", "supabase_db_url"))
    supabase_url: str = Field(default="", validation_alias=AliasChoices("SUPABASE_URL", "supabase_url"))
    supabase_anon_key: str = Field(default="", validation_alias=AliasChoices("SUPABASE_ANON_KEY", "supabase_anon_key"))
    storage_dir: str = "./storage/encrypted_files"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    google_client_id: str = ""
    google_allowed_audience: str = ""
    master_key_b64: str = ""

    @property
    def supabase_auth_url(self) -> str:
        return self.supabase_url.rstrip("/").removesuffix("/rest/v1") + "/auth/v1"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="CRYPTOVA_", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def storage_path(self) -> Path:
        path = Path(self.storage_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def effective_database_url(self) -> str:
        """Prefer Supabase Postgres while retaining SQLite for local development."""
        database_url = self.supabase_db_url.strip() or self.database_url.strip()
        if database_url.startswith("postgres://"):
            return "postgresql+psycopg://" + database_url[len("postgres://"):]
        if database_url.startswith("postgresql://") and "+psycopg" not in database_url:
            return "postgresql+psycopg://" + database_url[len("postgresql://"):]
        return database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
