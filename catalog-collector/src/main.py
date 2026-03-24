from dotenv import load_dotenv

from dataset import get_tmdb_dataset, scan_and_load_dataset
from rich import print
from db import create_db_and_tables, create_models_batched, insert_models
import logging


logging.basicConfig(level=logging.INFO)
load_dotenv()


def main():

    path = get_tmdb_dataset()
    print("Downloading dataset...")
    df = scan_and_load_dataset(path)
    print(f"Loaded dataset: {len(df)} records")
    create_db_and_tables()
    print("Processing batches...")
    models = create_models_batched(df)
    logging.info("Models created")
    insert_models(models)


if __name__ == "__main__":
    main()
