from pydantic import BaseModel


class Config(BaseModel):
    imdb: ImdbConfig
    tmdb: TmdbConfig


class ImdbConfig(BaseModel):
    name_basics: str
    akas: str
    title_basics: str
    crew: str
    episode: str
    principals: str
    ratings: str


class TmdbConfig(BaseModel):
    dataset_name: str
