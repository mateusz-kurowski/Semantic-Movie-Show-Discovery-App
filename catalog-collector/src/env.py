from functools import lru_cache
import os
from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class EnvConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "..", "..", ".env"), 
        extra="ignore"
    )
    database_url: PostgresDsn = Field(alias="DATABASE_URL")
    debug: bool = Field(alias="DEBUG", default=False)
    catalog_collector_service_on: bool = Field(
        alias="CATALOG_COLLECTOR_SERVICE_ON", default=True
    )
    dataset_load_percentage: int = Field(alias="DATASET_LOAD_PERCENTAGE", default=100)


@lru_cache
def get_envs() -> EnvConfig:
    return EnvConfig()
