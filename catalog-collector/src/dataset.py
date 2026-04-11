import logging
from pathlib import Path

import kagglehub
import polars as pl
from env import get_envs

# Download latest version


def get_tmdb_dataset() -> str:
    return kagglehub.dataset_download("asaniczka/tmdb-movies-dataset-2023-930k-movies")


def _resolve_dataset_csv(path: str) -> Path:
    dataset_path = Path(path)

    if dataset_path.is_file():
        return dataset_path

    if dataset_path.is_dir():
        csv_files = sorted(dataset_path.glob("*.csv"))
        if not csv_files:
            raise FileNotFoundError(
                f"No CSV files found in dataset directory: {dataset_path}"
            )

        if len(csv_files) == 1:
            return csv_files[0]

        return max(csv_files, key=lambda file: file.stat().st_size)

    raise FileNotFoundError(f"Dataset path does not exist: {dataset_path}")


def _rows_to_load(csv_path: Path, percentage: int) -> int | None:
    if percentage >= 100:
        return None

    if percentage <= 0:
        return 0

    with csv_path.open("rb") as csv_file:
        total_lines = sum(1 for _ in csv_file)

    data_rows = max(total_lines - 1, 0)
    rows = int(data_rows * (percentage / 100.0))

    if rows == 0 and data_rows > 0:
        return 1

    return rows


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
    env = get_envs()
    percentage = min(max(env.dataset_load_percentage, 0), 100)
    if percentage != env.dataset_load_percentage:
        logging.warning(
            "DATASET_LOAD_PERCENTAGE=%s is outside 0..100; using %s",
            env.dataset_load_percentage,
            percentage,
        )

    csv_path = _resolve_dataset_csv(path)
    n_rows = _rows_to_load(csv_path, percentage)

    query = (
        pl.scan_csv(
            str(csv_path),
            try_parse_dates=True,
            infer_schema_length=10000,
            n_rows=n_rows,
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


def str_to_str_list(text: str) -> list[str]:
    return [text.strip() for text in text.split(",")]


def get_unique_values_from_df_col(df: pl.DataFrame, col_name: str) -> list[str]:
    # 1. map_elements creates a Series of lists: e.g. [["a", "b"], ["b", "c"]]
    # 2. explode() flattens it to: ["a", "b", "b", "c"]
    # 3. unique() gets distinct values: ["a", "b", "c"]
    # 4. to_list() converts the Polars Series to a Python list

    return (
        df.get_column(col_name)
        .map_elements(str_to_str_list, return_dtype=pl.List(pl.String))
        .explode()
        .unique()
        .to_list()
    )
