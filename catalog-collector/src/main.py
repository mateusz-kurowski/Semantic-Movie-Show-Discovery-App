import logging

from dataset import explore_dataset, get_tmdb_dataset, scan_and_load_dataset
from db import create_db_and_tables, insert_movies_in_batches
from dotenv import load_dotenv
from env import get_envs
from rich.logging import RichHandler

load_dotenv()

# Set up beautiful and clear logging for local dev,
# which seamlessly intercepts via OpenTelemetry for production to SigNoz
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(rich_tracebacks=True, show_path=False)],
)


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

    if len(df) == 0:
        logging.info("no records to insert at the moment")
    else:
        import time

        start_time = time.time()
        logging.info("Processing batches...")
        insert_movies_in_batches(df)
        elapsed = time.time() - start_time
        logging.info(f"Finished inserting items to database in {elapsed:.2f} seconds")


if __name__ == "__main__":
    envs = get_envs()
    if not envs.catalog_collector_service_on:
        logging.info("Service is not running")
        exit(0)
    main()
