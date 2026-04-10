import logging

import kagglehub
import polars as pl

# Download latest version


def get_tmdb_dataset() -> str:
    return kagglehub.dataset_download("asaniczka/tmdb-movies-dataset-2023-930k-movies")


# schema = pl.Schema(
#     {
#         "id": pl.Int64(),
#         "title": pl.String(),
#         "vote_average": pl.Float16(),
#         "vote_count": pl.Int32,
#         "status": pl.String(),
#         "release_date": pl.Datetime(),
#         "revenue": pl.Int64,
#         "runtime": pl.Int32,
#         "adult": pl.Boolean,
#         "backdrop_path": pl.String(),
#         "budget": pl.Int64,
#         "homepage": pl.String(),
#         "imdb_id": pl.String(),
#         "original_language": pl.String(),
#         "original_title": pl.String(),
#         "overview": pl.String(),
#         "popularity": pl.Float16(),
#         "poster_path": pl.String(),
#         "tagline": pl.String(),
#         "genres": pl.String(),
#         "production_companies": pl.String(),
#         "production_countries": pl.String(),
#         "spoken_languages": pl.String(),
#         "keywords": pl.String(),
#     }
# )


def scan_and_load_dataset(path: str) -> pl.DataFrame:
    from .env import get_envs

    env = get_envs()
    percentage = env.dataset_load_percentage / 100.0

    n_rows = None
    if percentage < 1.0:
        with open(path, "rb") as f:
            total_lines = sum(1 for _ in f)
        n_rows = max(1, int((total_lines - 1) * percentage))

    query = (
        pl.scan_csv(
            path, try_parse_dates=True, infer_schema_length=10000, n_rows=n_rows
        )
        # .filter(pl.col("original_language") == "pl")
        .with_columns(pl.lit(False).alias("is_present_in_search"))
    )

    return query.collect(engine="streaming")


def explore_dataset(df: pl.DataFrame) -> None:
    """Logs the Polars dtype, python data types, and sample actual values for each column."""
    logging.info("Exploring dataset column types and sample values:")
    for col_name in df.columns:
        # Extract unique Python types from the column's evaluated values
        col_series = df[col_name].drop_nulls()
        unique_types = set(type(val).__name__ for val in col_series.to_list())
        types_str = ", ".join(sorted(unique_types))

        # Grab a few real sample values
        samples = col_series.unique().head(3).to_list()

        # Check if the column contains any null values or empty strings
        null_count = df[col_name].null_count()
        has_empty_strings = False
        if df[col_name].dtype == pl.String:
            has_empty_strings = (df[col_name] == "").sum() > 0

        has_nulls = null_count > 0 or has_empty_strings

        logging.info(
            f"Column '{col_name: <25}' | Polars: {str(df.schema[col_name]): <12} | PyTypes: {types_str: <15} | Nulls/Empty: {str(has_nulls): <5} | Samples: {samples}"
        )
