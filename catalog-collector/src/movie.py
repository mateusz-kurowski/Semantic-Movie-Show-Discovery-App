from datetime import date
from sqlalchemy import Column, BigInteger
from sqlmodel import Field, SQLModel


class Movie(SQLModel, table=True):
    id: int | None = Field(
        default=None, sa_column=Column(BigInteger(), primary_key=True)
    )
    title: str | None = None
    vote_average: float
    vote_count: int
    status: str
    release_date: date | None = None
    revenue: int = Field(default=0, sa_column=Column(BigInteger()))
    runtime: int
    adult: bool
    backdrop_path: str | None = None
    budget: int = Field(default=0, sa_column=Column(BigInteger()))
    homepage: str | None = None
    imdb_id: str | None = None
    original_language: str
    original_title: str | None = None
    overview: str | None = None
    popularity: float
    poster_path: str | None = None
    tagline: str | None = None
    genres: str | None = None
    production_companies: str | None = None
    production_countries: str | None = None
    spoken_languages: str | None = None
    keywords: str | None = None
    is_present_in_search: bool = Field(default=False)
