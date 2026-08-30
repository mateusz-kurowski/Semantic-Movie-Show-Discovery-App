# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Self-hosted semantic movie/show discovery app: search films by vibe or natural language via hybrid vector search (Qdrant). Four polyglot services form a pipeline, plus a Next.js frontend. Each service has its own `CLAUDE.md` with commands specific to that directory — read this file for cross-service architecture and rules, and the service's own `CLAUDE.md` before working inside it.

## Architecture & data flow

```
[TMDB/Kaggle dataset]
  -> catalog-collector (Python)   loads raw TMDB data into Postgres, idempotent batch inserts
  -> [Postgres]                   shared seam: movies + related entity tables
  -> catalog-ingester  (Go)       reads unprocessed movies, chunks + embeds text, upserts into Qdrant
  -> [Qdrant]                     dense vectors, queried at search time
  -> catalog-api       (TypeScript/Elysia/Bun)  REST API: search, embeddings, movies, auth, watchlist
  -> frontend          (Next.js 16 App Router)  search UI, movie details, auth, watchlist
```

This is a **Transactional Outbox**-style pipeline: `catalog-collector` writes movies (+ related entities) in one transaction; `catalog-ingester` independently polls for unprocessed rows and marks them processed after indexing. Long overviews are chunked before embedding (each chunk becomes a separate Qdrant point linked by `chunk_id`), preserving semantic granularity for search.

Postgres is the seam between `catalog-collector`, `catalog-ingester`, and `catalog-api` — each defines its own model of the shared tables independently (SQLModel, Go structs, Drizzle schema respectively). There is no single source of truth for table shape; a schema change must be applied in all three places:
- `catalog-api/src/db/catalog-schema.ts` (Drizzle, also owns migrations)
- `catalog-ingester/*.go` entity structs
- `catalog-collector/src/models/*.py` (SQLModel)

Qdrant collection name, dense vector name, and vector dimension must stay consistent between `catalog-ingester` (creates/writes the collection) and `catalog-api` (queries it) — each configures these independently via its own env vars; there's no shared config file enforcing agreement.

## Global commands

```bash
# Start local infra (Postgres + log/DB viewers)
docker compose up -d db

# Apply catalog-api's Drizzle migrations (the only service that owns schema migrations)
cd catalog-api && bunx drizzle-kit migrate

# Run each service's pre-commit checks (lint/format) across the whole repo
lefthook run pre-commit
```

There is no end-to-end test suite configured yet in this repo. Each service has its own unit test command — see that service's `CLAUDE.md`. When adding E2E coverage, wire it up against `docker compose` services rather than mocking cross-service boundaries.

Each service has its own `.env`/`.env.example` — copy and fill in before running that service.

## MCP tools

Project MCP servers are declared in `.mcp.json` (repo root). Credentials live in `.env.mcp` (gitignored) — copy `.env.mcp.example`, fill it in, and export it into your shell before starting Claude Code; `.mcp.json` expands `${VAR}` from the environment, it doesn't load `.env` files itself.

- **`fetch`** — fetch a URL's raw content. Use for pulling a specific docs page or changelog (e.g. an Elysia/Drizzle/Qdrant API reference) when you need the current text, not a search.
- **`brave-search`** — general web search. Use to find the relevant docs page or library version in the first place, before falling back to `fetch`.
- **`playwright`** — browser automation. Use to take a screenshot or click through a flow after a `frontend` UI change (start `bun run dev` first) — e.g. screenshot the search page after a layout change, or drive the sign-in → search → watchlist path to confirm nothing broke. Prefer this over asserting a frontend change "looks right" from code alone.
- **`qdrant`** — query the same Qdrant collection `catalog-ingester` writes and `catalog-api` searches. Use to sanity-check that ingested points/payloads/vector names look right, especially after touching the ingester's chunking or embedding logic.
- **`postgres`** — read the same Postgres DB the services share. Use to check actual row data or migration results instead of inferring them from the Drizzle schema alone.
- **`redis`** — inspect `catalog-api`'s query-embedding cache.

## Versioning & releases

**One version for the whole app**, not one per service. All four services ship together (`compose.coolify.yaml` builds every image from this repo) and a change to the Postgres seam has to land in three of them at once, so per-service versions could not be honest.

The **git tag is the source of truth**, and every service manifest mirrors it: release-please rewrites `frontend/package.json`, `catalog-api/package.json` and `catalog-collector/pyproject.toml` on each release via `extra-files`. Those numbers are bot-written and always hold the *app* version, never a service-specific one — never bump them by hand.

Releases are automated by `release-please` (`.github/workflows/release-please.yml`; config in `release-please-config.json`, current version in `.release-please-manifest.json`). It reads the Conventional Commits on `main`, maintains a standing `chore(main): release x.y.z` PR with a generated `CHANGELOG.md`, and tags `vX.Y.Z` when that PR is merged. `feat:` bumps the minor, `fix:` the patch, `feat!:`/`BREAKING CHANGE:` the major — except below `1.0.0`, where a breaking change bumps the minor instead. The `go` release-type is deliberate: it is the only strategy that updates no manifest on its own, which keeps the tag authoritative and the `extra-files` list explicit.

The footer reads that stamped version directly — `frontend/components/layout/footer/footer.tsx` imports `version` from `package.json` — so there is nothing to configure in any environment; CI, Coolify and `bun run dev` all show the last released version. Coolify auto-deploys `main`, so production usually runs some commits *ahead* of the version it displays, and the footer flips to the new number when the release PR merge triggers its redeploy.

Docker tags follow the same split: `:latest` tracks the tip of `main` (published by each service's own workflow on every push touching its directory), while `:vX.Y.Z` is published only by the `publish-images` job in `release-please.yml`, built from the tag itself. That job deliberately lives in the release workflow rather than an `on: push: tags` one, because a tag created with `GITHUB_TOKEN` cannot trigger another workflow run. Note that the release commit rewrites three service manifests, so it does trip the `frontend`, `catalog-api` and `catalog-collector` path filters and re-runs their normal CI. `catalog-api` and `frontend` publish no images at all; Coolify builds them from source.

## Project rules

- **Conventional Commits.** All commit messages must follow the `type(scope): summary` format (`feat`, `fix`, `refactor`, `chore`, `test`, `docs`, etc.). Prefer scoping to the service directory when the change is service-local, e.g. `fix(catalog-api): validate qdrant vector dimension`. The type now drives the release: only `feat`, `fix` and `deps` bump the version, so use `test:`/`refactor:`/`chore:` literally — labelling a test or a refactor as `feat:` publishes a minor release for it. Squash-merge PRs, so intermediate `fix:` commits for bugs that never reached `main` stay out of the changelog.
- **No cross-service direct code imports.** `catalog-api`, `catalog-ingester`, `catalog-collector`, and `frontend` communicate only through Postgres, Qdrant, and HTTP — never import source files, packages, or modules across service directories. Shared data-shape changes are duplicated deliberately per service (see Architecture above), not extracted into a shared library.
- **Never delete or weaken existing unit tests while refactoring.** If a refactor makes a test obsolete, that's a signal to update the test to match new behavior, not to delete or skip it. Removing test coverage requires explicit user confirmation first.
