import logging

import polars as pl
from env import get_envs
from models.movie import Movie
from models.genre import Genre
from models.keyword import Keyword
from models.company import Company
from models.country import Country
from models.language import Language
from models.links import (
    MovieGenreLink,
    MovieCompanyLink,
    MovieCountryLink,
    MovieLanguageLink,
    MovieKeywordLink,
)
from models.named_entity import create_entries, get_all_records

from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session, SQLModel, create_engine

envs = get_envs()
connect_args = {}
# Turning echo=False drastically speeds up execution
engine = create_engine(str(envs.database_url), echo=False, connect_args=connect_args)

logging.info("Connected to db")


def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
        logging.info("Ensured database tables exist")
    except Exception as e:
        logging.error(f"Creating db and tables failed: {e}")


def _upsert_entities(model_cls, names: list[str]) -> dict[str, int]:
    """
    Inserts a list of entity names using ON CONFLICT DO NOTHING,
    fetches all entities of that type from the DB, and returns a name -> id mapping.
    """
    if not names:
        return {}

    with Session(engine) as session:
        stmt = insert(model_cls).values([{"name": name} for name in names])
        # NamedEntities might not have unique constraint on name yet, but let's assume we handle duplicates in app logic for now
        # Actually, let's just use regular insert and ignore conflicts if name is unique.
        # But wait, our named entities don't have a UNIQUE constraint on name!
        # Since this is a one-time dataset load, let's fetch existing, and only insert new ones.
        pass

    # Safe generic approach:
    # 1. Fetch existing names
    existing = get_all_records(engine, model_cls)
    existing_map = {e.name: e.id for e in existing}

    # 2. Filter new names
    new_names = [n for n in names if n not in existing_map]

    if new_names:
        create_entries(engine, [model_cls(name=n) for n in new_names])
        # Refetch to get IDs of newly inserted records
        existing = get_all_records(engine, model_cls)
        existing_map = {e.name: e.id for e in existing}

    return existing_map


def _parse_list_col(val: str | None) -> list[str]:
    if not val:
        return []
    return [v.strip() for v in val.split(",") if v.strip()]


def insert_movies_in_batches(
    df: pl.DataFrame, batch_size: int = 10_000, commit_every_n_batches: int = 10
):
    from dataset import get_unique_values_from_df_col

    logging.info("Extracting unique entities from dataset...")

    def extract_col(col_name):
        # We need to handle nulls and empty strings
        filtered = df.drop_nulls(col_name).filter(pl.col(col_name) != "")
        if len(filtered) == 0:
            return []
        return get_unique_values_from_df_col(filtered, col_name)

    unique_genres = extract_col("genres")
    unique_keywords = extract_col("keywords")
    unique_companies = extract_col("production_companies")
    unique_countries = extract_col("production_countries")
    unique_languages = extract_col("spoken_languages")

    logging.info("Upserting named entities to database...")
    genre_map = _upsert_entities(Genre, unique_genres)
    keyword_map = _upsert_entities(Keyword, unique_keywords)
    company_map = _upsert_entities(Company, unique_companies)
    country_map = _upsert_entities(Country, unique_countries)
    language_map = _upsert_entities(Language, unique_languages)

    logging.info("Entities upserted. Beginning movie batched inserts...")

    with Session(engine) as session:
        movie_stmt = insert(Movie)

        # Exclude relationship fields from update_dict
        excluded_cols = {
            "genres",
            "production_companies",
            "production_countries",
            "spoken_languages",
            "keywords",
        }
        update_dict = {
            c.name: c for c in movie_stmt.excluded if c.name not in excluded_cols
        }
        movie_stmt = movie_stmt.on_conflict_do_update(
            index_elements=["id"], set_=update_dict
        )

        for chunk_idx, chunk in enumerate(df.iter_slices(batch_size)):
            # Convert to dicts but we need to drop the string representation of relationships
            # for the main movie table insert
            raw_records = chunk.to_dicts()
            movie_records = []

            link_genres = []
            link_keywords = []
            link_companies = []
            link_countries = []
            link_languages = []

            for r in raw_records:
                # build links
                m_id = r["id"]

                for g in _parse_list_col(r.get("genres")):
                    if g in genre_map:
                        link_genres.append({"movie_id": m_id, "genre_id": genre_map[g]})

                for k in _parse_list_col(r.get("keywords")):
                    if k in keyword_map:
                        link_keywords.append(
                            {"movie_id": m_id, "keyword_id": keyword_map[k]}
                        )

                for c in _parse_list_col(r.get("production_companies")):
                    if c in company_map:
                        link_companies.append(
                            {"movie_id": m_id, "company_id": company_map[c]}
                        )

                for c in _parse_list_col(r.get("production_countries")):
                    if c in country_map:
                        link_countries.append(
                            {"movie_id": m_id, "country_id": country_map[c]}
                        )

                for l in _parse_list_col(r.get("spoken_languages")):
                    if l in language_map:
                        link_languages.append(
                            {"movie_id": m_id, "language_id": language_map[l]}
                        )

                # clean movie record
                mr = {k: v for k, v in r.items() if k not in excluded_cols}
                movie_records.append(mr)

            # Insert movies
            session.exec(movie_stmt, params=movie_records)

            # Insert Links (Ignore Conflicts)
            if link_genres:
                session.exec(
                    insert(MovieGenreLink).on_conflict_do_nothing(), params=link_genres
                )
            if link_keywords:
                session.exec(
                    insert(MovieKeywordLink).on_conflict_do_nothing(),
                    params=link_keywords,
                )
            if link_companies:
                session.exec(
                    insert(MovieCompanyLink).on_conflict_do_nothing(),
                    params=link_companies,
                )
            if link_countries:
                session.exec(
                    insert(MovieCountryLink).on_conflict_do_nothing(),
                    params=link_countries,
                )
            if link_languages:
                session.exec(
                    insert(MovieLanguageLink).on_conflict_do_nothing(),
                    params=link_languages,
                )

            logging.info(f"Inserted batch {chunk_idx + 1}")

            if (chunk_idx + 1) % commit_every_n_batches == 0:
                session.commit()
                logging.info(f"Committed up to batch {chunk_idx + 1}")

        session.commit()
        logging.info("Final missing batches committed.")
