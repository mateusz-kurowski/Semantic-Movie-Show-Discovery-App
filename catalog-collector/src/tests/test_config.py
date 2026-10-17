import pytest
import tomli
from pydantic import ValidationError

from config import get_config
from models.config import Config

IMDB_KEYS = [
    "name_basics",
    "akas",
    "title_basics",
    "crew",
    "episode",
    "principals",
    "ratings",
]

TMDB_KEYS = ["dataset_name"]


def _write_config(tmp_path, imdb_keys=IMDB_KEYS, tmdb_keys=TMDB_KEYS):
    (tmp_path / "config").mkdir()
    body = (
        "[imdb]\n"
        + "".join(
            f'{k} = "https://datasets.imdbws.com/{k}.tsv.gz"\n' for k in imdb_keys
        )
        + "\n[tmdb]\n"
        + "".join(f'{k} = "x/{k}"\n' for k in tmdb_keys)
    )
    (tmp_path / "config" / "config.toml").write_text(body)


def test_load_imdb_config(monkeypatch, tmp_path):
    _write_config(tmp_path)
    monkeypatch.chdir(tmp_path)

    config = get_config()

    assert isinstance(config, Config)
    assert config.imdb.ratings == "https://datasets.imdbws.com/ratings.tsv.gz"
    assert config.imdb.name_basics == "https://datasets.imdbws.com/name_basics.tsv.gz"
    assert config.tmdb.dataset_name == "x/dataset_name"


def test_load_imdb_config_ignores_unmodelled_sections(monkeypatch, tmp_path):
    _write_config(tmp_path)
    with open(tmp_path / "config" / "config.toml", "a") as fp:
        fp.write('\n[other]\nfoo = "bar"\n')
    monkeypatch.chdir(tmp_path)

    assert get_config().imdb.akas.endswith("akas.tsv.gz")


def test_load_imdb_config_missing_key(monkeypatch, tmp_path):
    _write_config(tmp_path, imdb_keys=[k for k in IMDB_KEYS if k != "ratings"])
    monkeypatch.chdir(tmp_path)

    with pytest.raises(ValidationError, match="ratings"):
        get_config()


def test_load_config_missing_tmdb_key(monkeypatch, tmp_path):
    _write_config(tmp_path, tmdb_keys=[])
    monkeypatch.chdir(tmp_path)

    with pytest.raises(ValidationError, match="dataset_name"):
        get_config()


def test_load_imdb_config_missing_file(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)

    with pytest.raises(FileNotFoundError):
        get_config()


def test_load_imdb_config_invalid_toml(monkeypatch, tmp_path):
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "config.toml").write_text("not = [valid")
    monkeypatch.chdir(tmp_path)

    with pytest.raises(tomli.TOMLDecodeError):
        get_config()
