# Catalog Ingester

`catalog-ingester` is a Go microservice that continuously or periodically syncs movie catalog data from a PostgreSQL database into a [Qdrant](https://qdrant.tech/) vector database. It reads movie metadata and descriptions, chunks them to fit context windows, generates semantic embeddings (either via a local endpoint like HuggingFace Text Embeddings Inference or Qdrant Cloud Inference), and upserts them for vector search.

## Features

- **Continuous or Periodic Sync**: Run the ingester on a fixed ticker interval (`INGEST_PERIOD_SECONDS`) or in a continuous loop for real-time syncing.
- **Smart Chunking**: Uses `langchaingo`'s Recursive Character text splitter to safely divide long overviews while preserving core metadata (titles, genres, ratings, keywords) in every chunk.
- **Flexible Embedding Options**:
  - **Local TEI Support**: Connects to any `/embed` endpoint (e.g., HuggingFace TEI) using E5-style formatting (`passage: ` prefix).
  - **Qdrant Cloud Inference**: Alternatively, delegate embedding generation entirely to Qdrant Cloud Inference.
- **Parallel Processing**: Supports concurrent batch processing of embeddings (`EMBEDDING_MAX_PARALLEL`) to maximize throughput.
- **Observability Built-in**: Full OpenTelemetry (OTel) support for distributed tracing and structured logging (via `slog`).

## Prerequisites

- Go 1.26 or later
- A running PostgreSQL database (with the `movies` table schema initialized)
- A running Qdrant instance (local or cloud)
- (Optional) A Text Embeddings Inference (TEI) service running locally, or Qdrant Cloud credentials for built-in inference
- (Optional) OpenTelemetry Collector for traces/logs

## Environment Variables

The service is configured entirely via environment variables. You can provide these in a `.env`, `.env.development`, or `.env.development.local` file.

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgresql://user:pass@localhost:5432/db` |
| `PRODUCTION` | Enables production mode | `false` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry collector endpoint | `localhost:4318` |
| `OTEL_SERVICE_NAME` | Service name for tracing/logging | `catalog-ingester` |
| `INGEST_PERIOD_SECONDS` | Ingestion loop interval. `0` = continuous loop. | `15` |
| `INGEST_BATCH_SIZE` | Number of movies to fetch and process at once | `8` |
| `QDRANT_HOST` | Qdrant host URL | `localhost` |
| `QDRANT_PORT` | Qdrant GRPC Port | `6334` |
| `QDRANT_COLLECTION_NAME` | The Qdrant collection to insert points into | `movies` |
| `QDRANT_DENSE_VECTOR_NAME` | The named vector field for the embeddings | `overview-dense-vector` |
| `QDRANT_API_KEY` | API Key for Qdrant (if using Cloud or secured instance) | |
| `QDRANT_USE_SSL` | Enable TLS/SSL for Qdrant connection | `false` |
| `USE_QDRANT_INFERENCE` | Use Qdrant's built-in inference instead of a local model | `false` |
| `QDRANT_INFERENCE_MODEL` | Qdrant Cloud Inference Model ID (if enabled) | |
| `EMBEDDING_MODEL_ENDPOINT` | Local TEI endpoint (if `USE_QDRANT_INFERENCE=false`) | `http://localhost:8080/embed` |
| `EMBEDDING_MAX_PARALLEL` | Max concurrent batch embedding requests | `2` |
| `EMBEDDING_TIMEOUT_SECONDS` | Timeout for embedding generation requests | `30` |

## Running Locally

1. **Clone the repository and enter the directory**:
   ```bash
   cd catalog-ingester
   ```

2. **Copy the example environment file**:
   ```bash
   cp .env.example .env.development.local
   ```
   *(Edit `.env.development.local` to match your local setup.)*

3. **Download dependencies**:
   ```bash
   go mod download
   ```

4. **Run the service**:
   ```bash
   go run .
   ```

## Docker

A `Dockerfile` is provided for containerized deployments.

```bash
docker build -t catalog-ingester .
docker run --env-file .env -it catalog-ingester
```

## Architecture & Flow

1. **Fetch**: Connects to Postgres (via Gorm) and fetches a batch of movies that have not yet been synced (e.g., `search_exists = false`).
2. **Chunk**: Wraps core movie metadata (Title, Year, Genres, Ratings) and chunks the `Overview` text to keep tokens under 512 (approx ~1200 characters) to fit E5 context windows.
3. **Embed**: Sends chunks to the embedding model endpoint in parallel batches, prefixed with `passage: `.
4. **Ingest**: Maps the returned float32 vectors to Qdrant `PointStruct` payloads and upserts them to the Qdrant cluster.
5. **Update**: Marks the successfully ingested movies in Postgres to prevent duplicate processing.
