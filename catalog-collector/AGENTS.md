# AGENTS.md

Service-specific commands for `catalog-collector` (Python / uv). See the root `AGENTS.md` for cross-service architecture and rules.

## Commands

```bash
uv sync                                                              # install deps
uv run --env-file .env.development.local watchfiles 'python src/main.py'   # local dev run, restarts on change

uv run pytest                                          # all tests
uv run pytest src/tests/test_dataset.py::test_name      # single test

uv run ruff check --fix .        # lint
uv run ruff format .             # format
```

Ruff runs on staged `*.py` files through Lefthook (`.lefthook.yml`, extended by the root `.lefthook.yml`). Run `lefthook run pre-commit` from the repo root to execute the hook manually; run the ruff commands above after Python changes.

Requires Python >=3.14.
