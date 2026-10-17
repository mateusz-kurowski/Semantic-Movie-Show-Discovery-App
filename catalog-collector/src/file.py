import httpx


def download_file(path: str) -> str:
    httpx.get(path)
