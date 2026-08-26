# CLAUDE.md

Service-specific commands for `catalog-collector` (Python / uv). See the root `CLAUDE.md` for cross-service architecture and rules.

## Commands

```bash
uv sync                                                              # install deps
uv run --env-file .env.development.local watchfiles 'python src/main.py'   # local dev run, restarts on change

uv run pytest                                          # all tests
uv run pytest src/tests/test_dataset.py::test_name      # single test

uv run ruff check --fix .        # lint
uv run ruff format .             # format
```

Requires Python >=3.14.
