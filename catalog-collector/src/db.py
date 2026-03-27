from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, BigInteger
from sqlmodel import Field, SQLModel, create_engine
from env import get_envs
from pydantic import BaseModel, ConfigDict
import polars as pl
from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session
from datetime import date


class MyModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metadata: dict[str, str] = Field(alias="metadata_")


Base = declarative_base()


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


# sql_model = MovieModel(metadata_={"key": "val"}, id=1)
# pydantic_model = MyModel.model_validate(sql_model)
envs = get_envs()
connect_args = {}
engine = create_engine(str(envs.database_url), echo=True, connect_args=connect_args)

print("Connected to db")


def create_db_and_tables():
    try:
        SQLModel.metadata.drop_all(engine)
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"Creating db and tables failed: {e}")


def insert_movies_in_batches(df: pl.DataFrame, batch_size: int = 10_000):
    """
    Takes the raw Polars DataFrame, converts it into chunks of dictionaries,
    and uses SQLAlchemy bulk inserts.
    """
    with Session(engine) as session:
        # iter_slices divides the huge dataframe into smaller logical chunks
        for chunk_idx, chunk in enumerate(df.iter_slices(batch_size)):
            records = chunk.to_dicts()

            # Create a single bulk insert statement for the entire batch
            stmt = insert(Movie).values(records)

            # Keep your safe insert logic entirely in SQL!
            stmt = stmt.on_conflict_do_nothing(index_elements=["id"])

            # Execute the batch (1 query per 10,000 rows instead of 10,000 queries)
            session.exec(stmt)

            print(f"Inserted batch {chunk_idx + 1}")

        session.commit()
