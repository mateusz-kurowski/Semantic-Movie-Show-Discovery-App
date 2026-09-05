---
name: qdrant-consistency
description: Keeps Qdrant collection, vector-name, and dimension in sync between ingester and api. Use ONLY when touching ingester chunking/embedding logic or api search/query code.
---

# Qdrant Consistency

`catalog-ingester` (Go) creates/writes the collection (chunks long overviews; each chunk becomes a separate Qdrant point linked by `chunk_id`). `catalog-api` (TypeScript/Elysia/Bun) queries it at search time. Each side configures collection name, dense vector name, and vector dimension independently via its own env vars — there is no shared config file enforcing agreement.

## Rules

- When changing chunking, embedding model, vector size, collection name, or vector name in `catalog-ingester/*.go`, make the matching env/config change on the `catalog-api` side (and vice versa).
- Keep all three in sync: collection name, dense vector name, vector dimension.
- Check each service's own `.env` / `.env.example` — copy and fill in before running that service.
- Distinguish the `movie-collection` (ingester-written, api-queried dense vectors) from any `fastembed` memory/cache collection — do not point search at the wrong collection or rename one thinking it renames both.

## Verify

- Sanity-check ingested points, payloads, and vector names via the `qdrant` MCP server after touching chunking or embedding logic.
- Confirm `catalog-ingester` collection creation matches what `catalog-api` queries (names + dimension).
- Run affected service checks: `go test ./...` for the ingester; `bun run dev` smoke + `biome check` for the api.
