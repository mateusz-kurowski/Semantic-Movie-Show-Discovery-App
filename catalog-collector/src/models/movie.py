from datetime import date
from typing import TYPE_CHECKING, List
from sqlalchemy import Column, BigInteger
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from models.genre import Genre
    from models.company import Company
    from models.country import Country
    from models.language import Language
    from models.keyword import Keyword

from models.links import (
    MovieGenreLink,
    MovieCompanyLink,
    MovieCountryLink,
    MovieLanguageLink,
    MovieKeywordLink,
)


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

    genres: List["Genre"] = Relationship(link_model=MovieGenreLink)
    production_companies: List["Company"] = Relationship(link_model=MovieCompanyLink)
    production_countries: List["Country"] = Relationship(link_model=MovieCountryLink)
    spoken_languages: List["Language"] = Relationship(link_model=MovieLanguageLink)
    keywords: List["Keyword"] = Relationship(link_model=MovieKeywordLink)

    is_present_in_search: bool = Field(default=False)
