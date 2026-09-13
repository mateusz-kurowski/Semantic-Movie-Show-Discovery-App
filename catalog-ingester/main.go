package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type GlobalEnv struct {
	Validate       *validator.Validate
	Logger         *slog.Logger
	TracingContext *context.Context
	DB             *gorm.DB
	CacheClient    *redis.Client
}

type MovieEmbedding struct {
	Movie     Movie
	Embedding []float32
}

const defaultIngestPeriodSeconds = 15

func main() {
	env := GlobalEnv{
		Logger:   slog.New(slog.NewTextHandler(os.Stderr, nil)),
		Validate: validator.New(validator.WithRequiredStructEnabled()),
	}

	ctx := context.Background()

	vars := ReadAndValidateEnvs(env)

	// Create cache client
	cacheClient, err := createCacheClient(vars)
	if err != nil {
		env.Logger.Error("Failed to create cache client", "error", err.Error())
		return
	}

	defer cacheClient.Close()

	env.CacheClient = cacheClient

	// connect to DB
	db, err := initDB(env.Logger, vars.DatabaseURL)
	if err != nil {
		env.Logger.Error("Connection to DB failed", "error", err.Error())
		return
	}
	env.DB = db

	// Create db connection
	sqlDB, errDB := db.DB()
	if errDB == nil {
		defer sqlDB.Close()
	}

	// Create Qdrant client
	qdrantClient, err := initQdrant(ctx, env, vars)
	if err != nil {
		env.Logger.Error("Failed to create Qdrant client", "error", err.Error())
		defer qdrantClient.Close()
		return
	}

	// Create openai client
	openaiClient := newOpenaiClient(vars)

	// test openai client connection
	_, errModelsList := openaiClient.Models.List(ctx)
	if errModelsList != nil {
		env.Logger.ErrorContext(ctx, "OpenAI client not working",
			"error", errModelsList.Error())
		return
	}

	env.Logger.Info("Successfully started application and connected to database")

	totalCount := 0

	ingest := func() (int, error) {
		return runIngest(ctx, env, qdrantClient, openaiClient, vars)
	}

	// If INGEST_PERIOD_SECONDS is set to 0, run ingestion in a continuous loop until no more movies are available
	if vars.IngestPeriodSeconds == 0 {
		env.Logger.Info("INGEST_PERIOD_SECONDS is 0, running ingestion in continuous loop mode")
		totalCount += runContinuousLoop(env, ingest)
	}

	ingestPeriodSeconds := resolveIngestPeriodSeconds(vars)

	ticker := time.NewTicker(time.Duration(ingestPeriodSeconds) * time.Second)
	defer ticker.Stop()

	// Initial ingestion before starting the ticker
	count, err := ingest()
	if err != nil {
		env.Logger.Error("Failed to run initial ingestion", "error", err.Error())
		return
	}
	totalCount += count
	env.Logger.InfoContext(ctx, "Initial ingestion completed", "count", count, "total_count", totalCount)

	for range ticker.C {
		ingestCount, ingestErr := ingest()
		if ingestErr != nil {
			env.Logger.Error("Failed to ingest movies", "error", ingestErr.Error())
		}
		totalCount += ingestCount
		env.Logger.InfoContext(ctx, "Ingestion completed", "count", ingestCount, "total_count", totalCount)
	}

	env.Logger.Info("Ingestion process completed. Exiting application.", "total_count", totalCount)
}

// runContinuousLoop ingests until a batch comes back empty, returning the total ingested.
func runContinuousLoop(env GlobalEnv, ingest func() (int, error)) int {
	total := 0

	for {
		count, ingestErr := ingest()
		if ingestErr != nil {
			env.Logger.Error("Failed to ingest movies", "error", ingestErr.Error())
		}

		total += count

		if count == 0 {
			env.Logger.Info("No more movies to ingest. Entering CRON mode. Exiting ingestion loop.")
			break
		}
	}

	return total
}

// resolveIngestPeriodSeconds defaults the ticker period unless configured.
func resolveIngestPeriodSeconds(vars EnvVars) int {
	if vars.IngestPeriodSeconds > 0 {
		return vars.IngestPeriodSeconds
	}

	return defaultIngestPeriodSeconds
}
