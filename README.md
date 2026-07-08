# Semantic Movie & Show Discovery App

A self-hosted semantic movie & show discovery app — find films by vibe, mood, or
natural language. Powered by hybrid vector search (Qdrant) and LLM-generated embeddings.

Built as a personal learning project to develop skills in:

- Vector search engineering (dense embeddings, Qdrant)
- Polyglot microservices architecture
- Embedding pipelines and chunking strategies
- Transactional Outbox pattern for reliable data pipelines

---

## Architecture

```
[TMDB Dataset / Kaggle]
    ↓
[catalog-collector] (Python)
    → loads TMDB movie dataset into PostgreSQL
    → idempotent batch inserts
           ↓
[catalog-ingester] (Go)
    → reads unprocessed movies from DB
    → generates embeddings via OpenAI-compatible API
    → indexes dense vectors into Qdrant
    → supports chunking for long texts
    → runs in continuous or periodic mode
           ↓
[catalog-api] (TypeScript / Elysia / Bun)
    → REST API for search & embedding
    → Qdrant vector search
    → Redis caching for query embeddings
    → OpenTelemetry observability (SigNoz)
           ↓
[frontend] (React + TanStack Router + Tailwind v4)
    → search UI with instant results
    → movie cards with poster, rating, genres
    → built with Vite
```

---

## Services

### `catalog-collector` — Python

Loads TMDB movie data from a Kaggle-hosted CSV dataset into PostgreSQL.

- Downloads the dataset via `kagglehub` on first run
- Filters and cleans records
- Batch-inserts movies and related entities (genres, keywords, companies, etc.) into PostgreSQL via SQLModel
- Idempotent — safe to re-run

### `catalog-ingester` — Go

Reads unprocessed movies from PostgreSQL, generates embeddings, and indexes them into Qdrant.

- **Embedding**: OpenAI-compatible API (Ollama, OpenAI, or any provider)
- **Chunking**: Configurable chunk size/overlap for long texts (default 1200 chars, 120 overlap)
- **Vector dimension**: Configurable (default 256)
- **Modes**:
  - `INGEST_PERIOD_SECONDS=0` — continuous loop until all movies are processed, then exits
  - `INGEST_PERIOD_SECONDS>0` — periodic polling (CRON-like)
- **Concurrency**: Configurable parallel embedding requests
- **Qdrant**: Creates collection if needed, indexes dense named vectors
- **Dependencies**: Uses `gorm` for DB access, `qdrant/go-client` for vector store, `openai` Go client for embeddings

### `catalog-api` — TypeScript (Elysia / Bun)

HTTP API that powers the frontend.

- **Framework**: [Elysia](https://elysiajs.com/) — fast Bun-native web framework
- **Search**: Qdrant vector search with dense embeddings
- **Cache**: Redis for caching query embeddings (avoids re-embedding popular searches)
- **Embedding**: Calls an embedding service (OpenAI-compatible) for query vectorization
- **Observability**: OpenTelemetry with OTLP export (SigNoz-compatible)
- **Validation**: TypeBox schemas for env vars and request validation

### `frontend` — React + TanStack Router + Tailwind v4

User interface for searching and discovering movies.

- **Routing**: TanStack Router with auto code-splitting
- **Styling**: Tailwind CSS v4
- **Build**: Vite with React Compiler for optimization
- Currently in early development — basic page structure established

---

## Key Patterns & Decisions

### Why Go for the Ingester

The embedding + indexing pipeline benefits from Go's concurrency model (goroutines for parallel embedding requests), strong typing for the complex data flow, and fast startup time. Go's `gorm` provides solid PostgreSQL support, and the `qdrant/go-client` offers a first-class gRPC client.

### Why TypeScript for the API

The API layer benefits from TypeScript's rich ecosystem for web frameworks (Elysia), familiar syntax, and the `@qdrant/js-client-rest` SDK. Bun provides fast startup and built-in Redis, TypeScript, and test support.

### Chunking Strategy

Long movie overviews are split into configurable chunks before embedding. Each chunk becomes a separate Qdrant point linked by `chunk_id`. This preserves semantic granularity — a search for a specific detail can match the relevant chunk rather than being diluted in a full-length overview.

### Transactional Outbox Pattern

`catalog-collector` writes movies + related entities in a single transaction.
`catalog-ingester` reads unprocessed movies independently and marks them as processed after indexing.

### Why Qdrant

Qdrant was chosen because it requires manual configuration of HNSW, quantization, dense vectors, and search parameters — providing hands-on experience with vector search internals.

---

## Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Vector Search    | Qdrant (dense vectors)                |
| Database         | PostgreSQL                            |
| Cache            | Redis                                 |
| Embeddings       | OpenAI-compatible API (Ollama, etc.)  |
| Data Source      | TMDB via Kaggle dataset               |
| API Server       | TypeScript / Elysia / Bun             |
| Ingestion Worker | Go                                    |
| Data Loader      | Python                                |
| Frontend         | React + TanStack Router + Tailwind v4 |
| Observability    | OpenTelemetry / SigNoz                |
| Infra            | Docker Compose / Coolify              |
| Hosting          | Self-hosted homelab                   |

---

## Project Structure

```
├── catalog-api/                  # TypeScript REST API (Elysia + Bun)
│   ├── src/
│   │   ├── index.ts              # Server entrypoint
│   │   ├── models/               # TypeBox schemas
│   │   ├── routes/               # Route handlers (search, embedding, movies)
│   │   └── services/             # Business logic (Qdrant, Redis, embedding)
│   ├── package.json
│   └── tsconfig.json
│
├── catalog-collector/            # Python data loader
│   ├── src/
│   │   ├── main.py               # Entrypoint
│   │   ├── dataset.py            # Kaggle dataset download + parsing
│   │   ├── db.py                 # PostgreSQL batch inserts
│   │   ├── env.py                # Pydantic env config
│   │   ├── models/               # SQLModel entities
│   │   └── tests/                # Pytest tests
│   ├── pyproject.toml
│   └── Dockerfile
│
├── catalog-ingester/             # Go embedding + indexing worker
│   ├── main.go                   # Entrypoint
│   ├── env.go                    # Env validation
│   ├── movie.go                  # Movie model + Qdrant payload mapping
│   ├── embeddings.go             # OpenAI client for embeddings
│   ├── search.go                 # Qdrant search operations
│   ├── db.go                     # DB connection + migrations
│   ├── utils.go                  # Shared utilities
│   ├── entities.go               # Sub-entity models
│   ├── *test.go                  # Go tests
│   ├── go.mod
│   └── Dockerfile
│
├── frontend/                     # React UI
│   ├── src/
│   │   ├── main.tsx              # App entrypoint
│   │   ├── routes/               # TanStack Router routes
│   │   └── index.css             # Tailwind styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── config/
│   └── qdrant/                   # Qdrant configuration
│
├── compose.yaml                  # Local development compose
├── compose.coolify.yaml          # Coolify deployment compose
├── .env.example                  # Shared env template
└── sonar-project.properties      # SonarQube config
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- An OpenAI-compatible embedding API (Ollama, OpenAI, etc.)
- Qdrant instance (local or cloud)

### Local Development

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd Semantic-Movie-Show-Discovery-App

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your database, Qdrant, and API credentials

# 3. Start infrastructure (PostgreSQL + Qdrant etc.)
docker compose up -d db

# 4. Load data
cd catalog-collector && uv run python src/main.py

# 5. Index embeddings
cd catalog-ingester && go run .

# 6. Start API
cd catalog-api && bun run src/index.ts

# 7. Start frontend
cd frontend && bun run dev
```

### Coolify Deployment

See `compose.coolify.yaml` for the production service definitions. Deploy:

- PostgreSQL, Redis, Qdrant as standalone Coolify services
- `catalog-collector`, `catalog-ingester`, `catalog-api` via the compose file
- `frontend` as a static site (build with `bun run build`, serve with nginx)

---

## Environment Variables

| Variable                   | Service            | Required | Description                                  |
| -------------------------- | ------------------ | -------- | -------------------------------------------- |
| `DATABASE_URL`             | collector/ingester | ✓        | PostgreSQL connection string                 |
| `QDRANT_HOST`              | ingester           | ✓        | Qdrant gRPC host                             |
| `QDRANT_PORT`              | ingester           | ✓        | Qdrant gRPC port                             |
| `QDRANT_USE_SSL`           | ingester           |          | Enable SSL for Qdrant (default: false)       |
| `QDRANT_API_KEY`           | ingester/api       | ✓        | Qdrant API key                               |
| `QDRANT_COLLECTION_NAME`   | ingester/api       | ✓        | Qdrant collection name                       |
| `QDRANT_DENSE_VECTOR_NAME` | ingester/api       |          | Vector name (default: overview-dense-vector) |
| `QDRANT_URL`               | api                | ✓        | Qdrant HTTP URL                              |
| `REDIS_URL`                | api                | ✓        | Redis connection URL                         |
| `EMBEDDING_SERVICE_URL`    | api                | ✓        | Embedding API endpoint                       |
| `OPENAI_BASE_URL`          | ingester           | ✓        | Embedding API base URL (OpenAI-compatible)   |
| `OPENAI_API_KEY`           | ingester           | ✓        | Embedding API key                            |
| `INGEST_BATCH_SIZE`        | ingester           |          | Batch size (default: 8)                      |
| `INGEST_PERIOD_SECONDS`    | ingester           | ✓        | Polling interval / 0 = continuous            |
| `VECTOR_DIMENSION`         | ingester           |          | Embedding dimension (default: 256)           |
| `DEBUG`                    | collector/ingester |          | Enable debug logging                         |
| `PRODUCTION`               | ingester           |          | Production mode flag                         |

---

## Learning Resources

- [Qdrant Essentials Course](https://qdrant.tech/course/essentials/)
- [Elysia.js Documentation](https://elysiajs.com/)
- [TanStack Router](https://tanstack.com/router)
- [Qdrant Hybrid Search with RRF](https://qdrant.tech/articles/hybrid-search/)
- [Transactional Outbox Pattern](https://www.wimdeblauwe.com/blog/2024/06/25/transactional-outbox-pattern-with-spring-boot/)
