from dataset import get_tmdb_dataset, scan_and_load_dataset
from rich import print
from db import create_db_and_tables, create_models_batched_async
import asyncio


async def main():
    path = get_tmdb_dataset()
    print("Downloading dataset...")
    df = scan_and_load_dataset(path)
    print(f"Loaded dataset: {len(df)} records")
    create_db_and_tables()
    print("Processing batches...")
    _ = await create_models_batched_async(df)
    print("Models created")


if __name__ == "__main__":
    asyncio.run(main())
