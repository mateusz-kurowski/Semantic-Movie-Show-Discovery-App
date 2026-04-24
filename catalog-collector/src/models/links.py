from sqlmodel import Field, SQLModel


class MovieGenreLink(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.id", primary_key=True)
    genre_id: int | None = Field(default=None, foreign_key="genre.id", primary_key=True)


class MovieCompanyLink(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.id", primary_key=True)
    company_id: int | None = Field(
        default=None, foreign_key="company.id", primary_key=True
    )


class MovieCountryLink(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.id", primary_key=True)
    country_id: int | None = Field(
        default=None, foreign_key="country.id", primary_key=True
    )


class MovieLanguageLink(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.id", primary_key=True)
    language_id: int | None = Field(
        default=None, foreign_key="language.id", primary_key=True
    )


class MovieKeywordLink(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.id", primary_key=True)
    keyword_id: int | None = Field(
        default=None, foreign_key="keyword.id", primary_key=True
    )
