---
name: postgres-seam-change
description: Handles shared Postgres table changes across the collector-ingester-api seam. Use ONLY when changing shared Postgres tables (movies or related entity tables) in this repo.
---

# Postgres Seam Change

Pipeline context: `catalog-collector` (Python) writes movies in one transaction → Postgres → `catalog-ingester` (Go) polls unprocessed rows → Qdrant. `catalog-api` reads Postgres. There is no single source of truth for table shape.

## Must edit all 3 seams (duplicate, never import)

1. `catalog-api/src/db/catalog-schema.ts` — Drizzle schema (owns migrations).
2. `catalog-ingester/*.go` — entity structs matching the same tables.
3. `catalog-collector/src/models/*.py` — SQLModel models for the same tables.

Do NOT import source files, packages, or modules across service directories. Services communicate only through Postgres, Qdrant, and HTTP. Duplication here is deliberate.

## Migration workflow (catalog-api owns schema)

- Generate migration from the Drizzle schema change:
  `cd catalog-api && bunx drizzle-kit generate`
- Apply locally:
  `cd catalog-api && bunx drizzle-kit migrate`
- Infra for local verify: `docker compose up -d db` (from repo root).

## Verify

- `bunx drizzle-kit generate` succeeds with no unexpected diff.
- Migration applies cleanly via `bunx drizzle-kit migrate`.
- Sanity-check actual rows/migration result via the `postgres` MCP server — read real row data instead of inferring from the Drizzle schema alone.
- Run each touched service's pre-commit checks via `lefthook run pre-commit` (root extends all 4 service configs).
