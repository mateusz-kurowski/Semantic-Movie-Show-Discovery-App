from sqlalchemy.orm import declarative_base
from sqlmodel import Field, SQLModel, create_engine
from env import get_envs
from pydantic import BaseModel, ConfigDict
import polars as pl
import asyncio


class MyModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metadata: dict[str, str] = Field(alias="metadata_")


Base = declarative_base()


class MovieModel2(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field()
    vote_average: float
    vote_count: float
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
    is_present_in_search: bool = Field(default=False)


# sql_model = MovieModel(metadata_={"key": "val"}, id=1)
# pydantic_model = MyModel.model_validate(sql_model)
envs = get_envs()
connect_args = {}
engine = create_engine(str(envs.database_url), echo=True, connect_args=connect_args)

print("Connected to db")


def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"Creating db and tables failed: {e}")


def get_session():
    from sqlmodel import Session

    with Session(engine) as session:
        yield session


def create_models_chunk(chunk: pl.DataFrame) -> list[MovieModel2]:
    return [MovieModel2(**row) for row in chunk.to_dicts()]


async def create_models_batched_async(
    df: pl.DataFrame, batch_size: int = 5000
) -> list[MovieModel2]:
    """
    Splits the dataframe into batches and processes them asynchronously
    using a thread pool, preventing the main thread from blocking.
    """
    tasks = []
    # iter_slices divides the huge dataframe into smaller logical DataFrame chunks
    for chunk in df.iter_slices(batch_size):
        tasks.append(asyncio.to_thread(create_models_chunk, chunk))

    # Wait for all chunks to finish instantiating
    results = await asyncio.gather(*tasks)

    # Flatten the list of lists into a single list
    return [model for batch in results for model in batch]
