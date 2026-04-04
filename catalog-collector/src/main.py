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
    logging.info("Processing batches...")
    insert_movies_in_batches(df)
    logging.info("Finished inserting items to database")


if __name__ == "__main__":
    main()
