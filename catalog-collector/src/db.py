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
# Turning echo=False drastically speeds up execution (no terminal printout loops for 1.4m queries)
engine = create_engine(str(envs.database_url), echo=False, connect_args=connect_args)

print("Connected to db")


def create_db_and_tables():
    try:
        # Create tables only if they don't exist in the database yet
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"Creating db and tables failed: {e}")


def insert_movies_in_batches(
    df: pl.DataFrame, batch_size: int = 10_000, commit_every_n_batches: int = 10
):
    """
    Takes the raw Polars DataFrame, converts it into chunks of dictionaries,
    and uses SQLAlchemy bulk inserts.
    Combines execution of `batch_size` inserts into transactions committed every `commit_every_n_batches` batches.
    """
    with Session(engine) as session:
        # 1. Create a SINGLE generic prepared statement (outside the loop!)
        stmt = insert(Movie)

        # Prepare the dictionary for the ON CONFLICT DO UPDATE clause
        update_dict = {c.name: c for c in stmt.excluded}

        # Keep your safe insert logic entirely in SQL!
        stmt = stmt.on_conflict_do_update(index_elements=["id"], set_=update_dict)

        # iter_slices divides the huge dataframe into smaller logical chunks
        for chunk_idx, chunk in enumerate(df.iter_slices(batch_size)):
            records = chunk.to_dicts()

            # 2. Execute the PREPARED batch by passing records into session.exec
            # This triggers SQLAlchemy 2.0+ native Fast Execution (executemany / INSERT MANY VALUES)
            # Instead of compiling 250,000 parameters in Python into a giant string, this offloads it directly to the C driver!
            session.exec(stmt, params=records)

            print(f"Inserted batch {chunk_idx + 1}")

            # Commit periodically to keep transactions optimized without ballooning memory
            if (chunk_idx + 1) % commit_every_n_batches == 0:
                session.commit()
                print(f"Committed up to batch {chunk_idx + 1}")

        # Commit any remaining uncommitted batches
        session.commit()
        print("Final missing batches committed.")
