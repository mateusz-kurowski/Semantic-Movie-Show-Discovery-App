from functools import lru_cache

from pydantic import AnyUrl, Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class EnvConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: PostgresDsn = Field(alias="DATABASE_URL")
    otel_exporter_otlp_endpoint: AnyUrl = Field(alias="OTEL_EXPORTER_OTLP_ENDPOINT")
    otel_exporter_otlp_insecure: bool = Field(alias="OTEL_EXPORTER_OTLP_INSECURE")
    otel_service_name: str = Field(
        alias="OTEL_SERVICE_NAME", default="catalog-collector"
    )
    otel_resource_attributes: str = Field(
        alias="OTEL_RESOURCE_ATTRIBUTES", default="deployment.environment=development"
    )
    # otel_python_logging_auto_instrumentation_enabled: bool = Field(
    #     alias="OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED", default=True
    # )
    dataset_output_dir: str = Field(alias="DATASET_OUTPUT_DIR")
    otel_logs_exporter: str = Field(alias="OTEL_LOGS_EXPORTER")
    otel_python_log_correlation: bool = Field(
        alias="OTEL_PYTHON_LOG_CORRELATION", default=True
    )
    debug: bool = Field(alias="DEBUG")
    production: bool = Field(alias="PRODUCTION")


@lru_cache
def get_envs() -> EnvConfig:
    return EnvConfig()
