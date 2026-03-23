# catalog-collector

Microservice design to periodically load the TMDB movies dataset and load it into the database.

## Development

Copy `.env.example` to `.env` and replace the values with proper ones.

Run:

```bash
uv sync
uv run watchfiles 'python src/main.py'
```
