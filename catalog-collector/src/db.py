import polars as pl
from env import get_envs
from movie import Movie
from pydantic import BaseModel, ConfigDict
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import declarative_base
from sqlmodel import Field, Session, SQLModel, create_engine


class MyModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metadata: dict[str, str] = Field(alias="metadata_")


Base = declarative_base()


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

            # Prepare the dictionary for the ON CONFLICT DO UPDATE clause
            update_dict = {c.name: c for c in stmt.excluded}

            # Keep your safe insert logic entirely in SQL!
            stmt = stmt.on_conflict_do_update(index_elements=["id"], set_=update_dict)

            # Execute the batch (1 query per 10,000 rows instead of 10,000 queries)
            session.exec(stmt)

            print(f"Inserted batch {chunk_idx + 1}")

        session.commit()
