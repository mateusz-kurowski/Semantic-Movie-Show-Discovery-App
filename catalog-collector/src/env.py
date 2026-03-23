from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from pydantic import PostgresDsn, AnyUrl
from functools import lru_cache


class EnvConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    database_url: PostgresDsn = Field(alias="DATABASE_URL")
    otel_exporter_otlp_endpoint: AnyUrl = Field(alias="OTEL_EXPORTER_OTLP_ENDPOINT")
    otel_exporter_otlp_insecure: bool = Field(alias="OTEL_EXPORTER_OTLP_INSECURE")
    otel_service_name: str = Field(
        alias="OTEL_SERVICE_NAME", default="catalog-collector"
    )
    dataset_output_dir: str = Field(alias="DATASET_OUTPUT_DIR")


@lru_cache
def get_envs() -> EnvConfig:
    return EnvConfig()
