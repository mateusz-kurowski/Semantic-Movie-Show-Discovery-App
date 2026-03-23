import kagglehub
import polars as pl

# Download latest version
from pydantic import BaseModel


def get_tmdb_dataset() -> str:
    return kagglehub.dataset_download("asaniczka/tmdb-movies-dataset-2023-930k-movies")


class MovieItem(BaseModel):
    id: str
    title: str
    vote_average: float
    vote_count: str
    status: str
    release_date: str
    revenue: int
    runtime: int
    adult: bool
    backdrop_path: str
    budget: int
    homepage: str
    imdb_id: str
    original_language: str
    original_title: str
    overview: str
    popularity: float
    poster_path: str
    tagline: str
    genres: str
    production_companies: str
    production_countries: str
    spoken_languages: str
    keywords: str


schema = pl.Schema(
    {
        "id": pl.String(),
        "title": pl.String(),
        "vote_average": pl.Float16(),
        "vote_count": pl.Int32,
        "status": pl.String(),
        "release_date": pl.Date(),
        "revenue": pl.Int64,
        "runtime": pl.Int32,
        "adult": pl.Boolean,
        "backdrop_path": pl.String(),
        "budget": pl.Int64,
        "homepage": pl.String(),
        "imdb_id": pl.String(),
        "original_language": pl.String(),
        "original_title": pl.String(),
        "overview": pl.String(),
        "popularity": pl.Float16(),
        "poster_path": pl.String(),
        "tagline": pl.String(),
        "genres": pl.String(),
        "production_companies": pl.String(),
        "production_countries": pl.String(),
        "spoken_languages": pl.String(),
        "keywords": pl.String(),
    }
)


def scan_and_load_dataset(path: str) -> pl.LazyFrame[MovieItem]:
    query = (
        pl.scan_csv(path, schema=schema)
        .filter(pl.col("original_language") == "pl")
        .with_columns(pl.lit(False).alias("is_present_in_search"))
    )
    return query.collect(engine="streaming")
