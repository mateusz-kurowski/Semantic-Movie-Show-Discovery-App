# catalog-collector

Microservice design to periodically load the TMDB movies dataset and load it into the database.

## Development

Copy `.env.example` to `.env` and replace the values with proper ones.

Run:

```bash
uv sync
uv run --env-file .env.development.local watchfiles 'python src/main.py'
```

### Testing

Run the test suite to verify data pipelines and parsing logic:

```bash
uv run pytest
```

### Linting and formatting

[Ruff](https://docs.astral.sh/ruff/) handles both linting and formatting:

```bash
uv run ruff check --fix .   # lint, apply safe fixes
uv run ruff format .        # format
```

These also run automatically on staged `*.py` files via [Lefthook](https://lefthook.dev/) (`.lefthook.yml`), which is included by the root config. Install the git hook once with `lefthook install`, or run the checks by hand from the repo root:

```bash
lefthook run pre-commit
```
