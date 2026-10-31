package main

import (
	"context"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type GlobalEnv struct {
	Validate       *validator.Validate
	Logger         *logrus.Logger
	TracingContext *context.Context
	DB             *gorm.DB
	CacheClient    *redis.Client
}

type MovieEmbedding struct {
	Movie     Movie
	Embedding []float32
}

const defaultIngestPeriodSeconds = 15

//nolint:funlen // linear startup wiring; tracing init pushed it over the limit.
func main() {
	env := GlobalEnv{
		Logger:   logrus.New(),
		Validate: validator.New(validator.WithRequiredStructEnabled()),
	}

	ctx := context.Background()

	vars := ReadAndValidateEnvs(env)

	shutdownTracing, err := initTracing(ctx)
	if err != nil {
		env.Logger.WithError(err).Error("Failed to init tracing")
		return
	}
	defer func() {
		if shutdownErr := shutdownTracing(ctx); shutdownErr != nil {
			env.Logger.WithError(shutdownErr).Error("Failed to flush traces")
		}
	}()

	// Create cache client
	cacheClient, err := createCacheClient(vars)
	if err != nil {
		env.Logger.WithError(err).Error("Failed to create cache client")
		return
	}

	defer cacheClient.Close()

	env.CacheClient = cacheClient

	// connect to DB
	db, err := initDB(env.Logger, vars.DatabaseURL)
	if err != nil {
		env.Logger.WithError(err).Error("Connection to DB failed")
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
		env.Logger.WithError(err).Error("Failed to create Qdrant client")
		defer qdrantClient.Close()
		return
	}

	// Create openai client
	openaiClient := newOpenaiClient(vars)

	// test openai client connection
	_, errModelsList := openaiClient.Models.List(ctx)
	if errModelsList != nil {
		env.Logger.WithContext(ctx).
			WithFields(logrus.Fields{"error": errModelsList.Error()}).
			Error("OpenAI client not working")
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
		env.Logger.WithError(err).Error("Failed to run initial ingestion")
		return
	}
	totalCount += count
	env.Logger.WithContext(ctx).
		WithFields(logrus.Fields{fieldCount: count, fieldTotalCount: totalCount}).
		Info("Initial ingestion completed")

	for range ticker.C {
		ingestCount, ingestErr := ingest()
		if ingestErr != nil {
			env.Logger.WithError(ingestErr).Error("Failed to ingest movies")
		}
		totalCount += ingestCount
		env.Logger.WithContext(ctx).
			WithFields(logrus.Fields{fieldCount: ingestCount, fieldTotalCount: totalCount}).
			Info("Ingestion completed")
	}

	env.Logger.WithFields(logrus.Fields{fieldTotalCount: totalCount}).
		Info("Ingestion process completed. Exiting application.")
}

// runContinuousLoop ingests until a batch comes back empty, returning the total ingested.
func runContinuousLoop(env GlobalEnv, ingest func() (int, error)) int {
	total := 0

	for {
		count, ingestErr := ingest()
		if ingestErr != nil {
			env.Logger.WithError(ingestErr).Error("Failed to ingest movies")
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
