import os

from dataset import explore_dataset, filter_df, get_tmdb_dataset, scan_and_load_dataset
from db import create_db_and_tables, insert_movies_in_batches
from dotenv import load_dotenv
from env import get_envs
from logger import log

dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    from dotenv import load_dotenv as _load

    _load()


def main():
    dataset_file_path = get_tmdb_dataset()
    log.info("Downloading dataset...")
    df = scan_and_load_dataset(dataset_file_path)

    filtered_df = filter_df(df)

    log.info(f"Loaded dataset. {len(filtered_df)} Rows.")
    envs = get_envs()

    if envs.debug:
        explore_dataset(filtered_df)

    log.info(f"Loaded dataset: {len(filtered_df)} records")
    create_db_and_tables()

    if len(filtered_df) == 0:
        log.info("no records to insert at the moment")
    else:
        import time

        start_time = time.time()
        log.info("Processing batches...")
        insert_movies_in_batches(filtered_df)
        elapsed = time.time() - start_time
        log.info(f"Finished inserting items to database in {elapsed:.2f} seconds")


if __name__ == "__main__":
    envs = get_envs()
    if not envs.catalog_collector_service_on:
        log.info("Service is not running")
        exit(0)
    main()
