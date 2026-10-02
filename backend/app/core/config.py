from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/hayat_studio"
    jwt_secret: str = "dev-only-secret-change-me"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:3000"
    frontend_url: str = "http://localhost:3000"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    admin_email: str = ""
    admin_password: str = ""
    admin_notify_email: str = ""

    resend_api_key: str = ""
    email_from: str = "Abdullah Hayat <onboarding@resend.dev>"

    storage_backend: str = "local"
    local_upload_dir: str = "./uploads"
    s3_bucket: str = ""
    s3_region: str = "auto"
    s3_endpoint_url: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    cloudinary_url: str = ""
    max_upload_mb: int = 15

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.app_env == "production" and s.jwt_secret.startswith("dev-only"):
        raise RuntimeError("JWT_SECRET must be set in production")
    return s
