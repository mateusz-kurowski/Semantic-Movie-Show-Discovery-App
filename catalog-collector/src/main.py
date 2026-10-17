import os
import sys

import kagglehub
from dotenv import load_dotenv

from config import get_config
from dataset import (
    explore_dataset,
    filter_df,
    scan_and_load_dataset,
)
from db import insert_movies_in_batches
from env import get_envs
from logger import log


def main():
    config = get_config()
    tmdb_dataset_name = config.tmdb.dataset_name
    log.info(f"Downloading TMDB dataset: {tmdb_dataset_name}")
    dataset_file_path = kagglehub.dataset_download(tmdb_dataset_name)
    df = scan_and_load_dataset(dataset_file_path)

    filtered_df = filter_df(df)

    log.info(f"Loaded dataset. {len(filtered_df)} Rows.")
    envs = get_envs()
    log.info(f"Reload mode: {'FULL' if envs.full_reload else 'INCREMENTAL'}")

    if envs.debug:
        explore_dataset(filtered_df)

    log.info(f"Loaded dataset: {len(filtered_df)} records")

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
    if not os.environ["PRODUCTION"]:
        set = load_dotenv()
        if not set:
            log.warn(".env file did not set any environment variable")

    envs = get_envs()
    if not envs.catalog_collector_service_on:
        log.info("CATALOG_COLLECTOR_SERVICE_ON set to False")
        log.info("catallog_collector gracefully closes...")
        sys.exit(0)
    main()
