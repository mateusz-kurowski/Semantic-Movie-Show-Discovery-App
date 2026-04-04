package main

import (
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
	Movie     Movie
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

	qdrantClient, err := initQdrant(vars)
	if err != nil {
		env.Logger.Error("Failed to create Qdrant client", "error", err.Error())
	} else {
		env.Logger.Info("Qdrant client created successfully")
	}

	env.Logger.Info("Successfully started application and connected to database")

	ticker := time.NewTicker(time.Duration(vars.IngestPeriodSeconds) * time.Second)
	defer ticker.Stop()

	// Initial ingestion before starting the ticker
	getMoviesAndIngest(ctx, env, qdrantClient, vars)

	for range ticker.C {
		env.Logger.Info("Ingestion cycle started")
		getMoviesAndIngest(ctx, env, qdrantClient, vars)
		env.Logger.Info("Ingestion cycle completed")
	}
}
