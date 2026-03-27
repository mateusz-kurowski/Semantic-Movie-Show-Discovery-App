from dotenv import load_dotenv

from dataset import get_tmdb_dataset, scan_and_load_dataset, explore_dataset
from db import create_db_and_tables, insert_movies_in_batches
import logging
from env import get_envs

logging.basicConfig(level=logging.INFO)
load_dotenv()


def main():

    path = get_tmdb_dataset()
    logging.info("Downloading dataset...")
    df = scan_and_load_dataset(path)
    logging.info(f"Loaded dataset. {len(df)} Rows.")
    envs = get_envs()

    if envs.debug:
        explore_dataset(df)

    logging.info(f"Loaded dataset: {len(df)} records")
    create_db_and_tables()
    logging.info("Processing batches...")
    insert_movies_in_batches(df)
    logging.info("Finished inserting items to database")


if __name__ == "__main__":
    main()
