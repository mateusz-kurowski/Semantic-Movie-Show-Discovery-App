import os

import tomli

from models.config import Config


def get_config() -> Config:
    config_path = os.path.join("config", "config.toml")
    with open(config_path, mode="rb") as fp:
        config = tomli.load(fp)
        return Config.model_validate(config)
