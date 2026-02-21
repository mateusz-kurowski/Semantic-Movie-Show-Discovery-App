# Semantic-Movie-Show-Discovery-App

A self-hosted semantic movie & show discovery app — find films by vibe, mood, or
natural language. Powered by hybrid vector search (Qdrant) and an AI agent (Spring AI).

Built as a personal learning project to develop skills in:

- Hybrid search engineering (dense + sparse vectors, RRF fusion)
- AI agents and MCP tool design (Spring AI)
- Polyglot microservices architecture
- Transactional Outbox pattern for reliable data pipelines

---

## Architecture

```
TMDB API
   ↓
[catalog-collector] (Go)
   → fetches movies periodically via time.Ticker
   → writes to PostgreSQL: movies + outbox(PENDING)
          ↓
[vector-indexer] (TypeScript)
   → polls outbox WHERE status=PENDING
   → generates embeddings via Ollama
   → indexes dense + sparse vectors into Qdrant
   → marks outbox rows as PROCESSED
          ↓
[discovery-api] (Java / Spring Boot)
   → REST API for the frontend
   → hybrid search: dense + sparse + RRF via Qdrant Query API
   → Redis for caching popular queries
   → Spring AI agent with MCP tools for natural language discovery
          ↓
[frontend] (React + Tailwind)
   → search bar with instant results
   → movie cards with AI "why this matches" explanation
   → agent chat panel
```

---

## Services

### `discovery-api` — Java / Spring Boot

Main REST API. The most complex service — most of the learning happens here.

- **Search**: Qdrant hybrid search (dense + sparse vectors fused with RRF)
- **Cache**: Redis for caching frequent queries
- **Database**: PostgreSQL via Spring Data JPA
- **AI**: Spring AI agent with MCP tools:
  - `search_by_vibe` — semantic natural language query
  - `find_similar` — find movies similar to a given title
  - `explain_recommendation` — LLM explains why a result matches
- **Embeddings**: Ollama (local, no API cost)

Key Spring AI dependency: `spring-ai-qdrant-store` for VectorStore integration.

### `catalog-collector` — Go

Simple background worker. Write it once, forget it.

- Runs on a `time.Ticker` (every 6 hours)
- Calls TMDB API via `golang-tmdb` wrapper
- Writes movies + outbox events to PostgreSQL via `pgx/v5`
- No HTTP server, no framework — pure stdlib + 2 dependencies

### `vector-indexer` — TypeScript (Node)

Background worker that closes the loop from DB to Qdrant.

- Polls `outbox` table for `status=PENDING` rows
- Calls Ollama to generate embeddings for each movie
- Indexes to Qdrant with both dense and sparse named vectors
- Marks outbox rows as `PROCESSED`
- Uses `@qdrant/js-client-rest` and `ollama` npm packages

### `frontend` — React + Tailwind

- Search bar with hybrid results
- Movie cards with poster, rating, genres, AI explanation
- Chat panel for the Spring AI agent

---

## Key Patterns & Decisions

### Transactional Outbox Pattern

Avoids dual-write inconsistency between PostgreSQL and Qdrant.
`catalog-collector` writes movies + outbox rows in a single transaction.
`vector-indexer` processes pending rows independently — if it crashes, it retries on
the next poll. No message queue needed at this scale.

### Hybrid Search in Qdrant

Each movie is stored as a Qdrant point with two named vectors:

- `dense` → sentence-transformer embedding of title + overview + genres + keywords
- `sparse` → BM25 sparse vector of the same text

A query runs both simultaneously and fuses results with RRF (Reciprocal Rank Fusion)
via Qdrant's Universal Query API. Structured filters (year, genre, rating) apply as
payload filters — no full scan.

### Why Qdrant over Meilisearch

Meilisearch abstracts hybrid search behind config. Qdrant requires you to manually
configure HNSW, quantization, dense/sparse vectors, and fusion strategy — which is
the actual skill being built here.

### Why No Message Queue

A full message queue (Kafka, RabbitMQ) is overkill for a single-app personal project.
The Outbox pattern gives the same delivery guarantee using only PostgreSQL — simpler
infrastructure, same correctness.

### Polyglot Services

Each service uses the best language for its complexity:

- `discovery-api` in Java — complex Spring AI + Qdrant logic, maximum Java learning
- `catalog-collector` in Go — simple scheduler, zero boilerplate
- `vector-indexer` in TypeScript — first-class Qdrant + Ollama SDKs available

---

## Data

Movies are sourced from the **TMDB API** (free API key, no credit card required).
Register at: https://www.themoviedb.org

Each movie document indexed into Qdrant:

```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "An insomniac office worker...",
  "genres": ["Drama", "Thriller"],
  "keywords": ["twist ending", "psychological", "underground"],
  "year": 1999,
  "rating": 8.4,
  "poster_url": "https://image.tmdb.org/..."
}
```

The embedding input text fed to Ollama:

```
title + overview + genres + keywords (concatenated)
```

Structured fields (`genres`, `year`, `rating`) are stored as Qdrant payload filters.

---

## Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Search         | Qdrant (hybrid: dense+sparse) |
| Database       | PostgreSQL                    |
| Cache          | Redis                         |
| Embeddings     | Ollama (local)                |
| Data source    | TMDB API (free key)           |
| Backend API    | Java 21 + Spring Boot         |
| Collector      | Go                            |
| Indexer worker | TypeScript (Node)             |
| Frontend       | React + Tailwind              |
| Infra          | Docker Compose                |
| Hosting        | Self-hosted homelab (Coolify) |

---

## Project Structure

```
movie-discovery/
│
├── discovery-api/                  # Spring Boot — main service
│   ├── src/main/java/
│   │   └── com/yourname/discovery/
│   │       ├── search/             # QdrantSearchService, SearchController
│   │       ├── movie/              # MovieRepository, MovieService
│   │       ├── cache/              # Redis config + CacheService
│   │       └── ai/                 # Spring AI agent + MCP tools
│   └── pom.xml
│
├── catalog-collector/              # Go — TMDB ingestion worker
│   ├── main.go
│   ├── tmdb/                       # TmdbClient wrapper
│   ├── db/                         # pgx pool + outbox writes
│   └── go.mod
│
├── vector-indexer/                 # TypeScript — embedding + Qdrant worker
│   ├── src/
│   │   ├── db.ts                   # PostgreSQL outbox reader
│   │   ├── embeddings.ts           # Ollama client
│   │   └── indexer.ts              # Qdrant writer + scheduler
│   └── package.json
│
├── frontend/                       # React + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar/
│   │   │   ├── MovieCard/
│   │   │   └── AgentChat/
│   │   └── api/
│   └── package.json
│
├── infra/
│   ├── docker-compose.yml          # All services + PostgreSQL + Qdrant + Redis
│   ├── init.sql                    # DB schema on startup
│   └── .env.example
│
└── README.md
```

---

## Getting Started

```bash
git clone https://github.com/yourname/movie-discovery
cd movie-discovery

cp infra/.env.example infra/.env
# Fill in: TMDB_API_KEY, DATABASE_URL, OLLAMA_HOST, QDRANT_URL, REDIS_URL

docker compose -f infra/docker-compose.yml up
```

Services start in order:

1. PostgreSQL + Qdrant + Redis + Ollama
2. `catalog-collector` — begins fetching from TMDB immediately on startup
3. `vector-indexer` — begins processing outbox PENDING rows
4. `discovery-api` — REST API available at `localhost:8080`
5. `frontend` — available at `localhost:3000`

---

## Learning Resources

- [Qdrant Essentials Course](https://qdrant.tech/course/essentials/) — Day 3 covers hybrid search pipeline
- [Spring AI Reference — Qdrant VectorStore](https://docs.spring.io/spring-ai/reference/api/vectordbs/qdrant.html)
- [Spring AI Agentic Patterns](https://spring.io/blog/2025/01/21/spring-ai-agentic-patterns)
- [Spring AI MCP Boot Starters](https://spring.io/blog/2025/09/16/spring-ai-mcp-intro-blog)
- [Qdrant Hybrid Search with RRF](https://qdrant.tech/articles/hybrid-search/)
- [Transactional Outbox Pattern with Spring Boot](https://www.wimdeblauwe.com/blog/2024/06/25/transactional-outbox-pattern-with-spring-boot/)
- [golang-tmdb wrapper](https://github.com/cyruzin/golang-tmdb)
