package main

import (
	"catalog-ingester/internal/movie"
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type GlobalEnv struct {
	Validate       *validator.Validate
	Logger         *slog.Logger
	TracingContext *context.Context
	DB             *gorm.DB
}

type MovieEmbedding struct {
	Movie     movie.Movie
	Embedding []float32
}

func main() {
	env := GlobalEnv{
		Logger:   slog.New(slog.NewTextHandler(os.Stderr, nil)),
		Validate: validator.New(validator.WithRequiredStructEnabled()),
	}

	ctx := context.Background()

	vars := ReadAndValidateEnvs(env)

	// enable OTLP logging
	logger, shutdownLog, err := createLogger(ctx, vars.OtlpEndpoint, vars.ServiceName)
	if err != nil {
		env.Logger.Error("failed to create OTLP logger", "error", err)
	} else {
		env.Logger = logger
		defer shutdownLog()
	}

	// Make it the default so standard logs are picked up
	slog.SetDefault(env.Logger)

	// enable tracing
	shutdownTrace, err := initTracer(ctx, vars.OtlpEndpoint)
	if err != nil {
		env.Logger.Error(err.Error())
	} else {
		defer func() { _ = shutdownTrace(ctx) }()
	}

	// connect to DB
	db, err := initDB(env.Logger, vars.DatabaseURL)
	if err != nil {
		env.Logger.Error("Connection to DB failed", "error", err.Error())
		shutdownLog() // Ensure logs are flushed before exiting
		return
	}
	env.DB = db

	sqlDB, errDB := db.DB()
	if errDB == nil {
		defer sqlDB.Close()
	}

	qdrantClient, err := initQdrant(ctx, env, vars)
	if err != nil {
		env.Logger.Error("Failed to create Qdrant client", "error", err.Error())
		return
	}

	env.Logger.Info("Successfully started application and connected to database")

	appStartTime := time.Now()
	initialSyncLogged := false

	runIngest := func() {
		count := getMoviesAndIngest(ctx, env, qdrantClient, vars)
		if count == 0 && !initialSyncLogged {
			elapsed := time.Since(appStartTime)
			env.Logger.Info(
				"no records to ingest / insert at the moment. Initial sync complete.",
				"duration_seconds",
				elapsed.Seconds(),
			)
			initialSyncLogged = true
		}
	}

	if vars.IngestPeriodSeconds == 0 {
		env.Logger.Info("INGEST_PERIOD_SECONDS is 0, running ingestion in continuous loop mode")
		for {
			runIngest()
		}
	}

	ticker := time.NewTicker(time.Duration(vars.IngestPeriodSeconds) * time.Second)
	defer ticker.Stop()

	// Initial ingestion before starting the ticker
	runIngest()

	for range ticker.C {
		runIngest()
	}
}
