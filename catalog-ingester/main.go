package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type GlobalEnv struct {
	Validate       *validator.Validate
	Logger         *slog.Logger
	TracingContext *context.Context
	Db             *gorm.DB
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
		defer shutdownTrace(ctx)
	}

	// connect to DB
	db, err := initDB(env.Logger, vars.DatabaseURL)
	if err != nil {
		env.Logger.Error("Connection to DB failed", "error", err.Error())
		shutdownLog() // Ensure logs are flushed before exiting
		os.Exit(1)
	}
	env.Db = db

	if sqlDB, err := db.DB(); err == nil {
		defer sqlDB.Close()
	}

	env.Logger.Info("Successfully started application and connected to database")
	movies, err := getMovies(env)
	if err != nil {
		env.Logger.Error("Failed to fetch movies from DB", "error", err.Error())
	}

	var movieEmbeddings []MovieEmbedding

	for _, m := range movies {
		env.Logger.Info("Movie fetched", "id", m.Id, "title", m.Title)
		if m.Overview != nil {
			overviewEmbedding, err := GetEmbeddings(ctx, *m.Overview, vars)
			if err != nil {
				env.Logger.Error("Failed to get embeddings", "error", err.Error())
			} else {
				movieEmbeddings = append(movieEmbeddings, MovieEmbedding{
					Movie:     m,
					Embedding: overviewEmbedding,
				})
				env.Logger.Info("Overview embeddings generated", "id", m.Id, "embedding_length", len(overviewEmbedding))
			}
		}
	}

	qdrantClient, err := initQdrant(vars)
	if err != nil {
		env.Logger.Error("Failed to create Qdrant client", "error", err.Error())
	} else {
		env.Logger.Info("Qdrant client created successfully")
	}

	if err := ingestMovies(ctx, qdrantClient, vars.QdrantCollectionName, movieEmbeddings); err != nil {
		env.Logger.Error("Failed to ingest movies into Qdrant", "error", err.Error())
	} else {
		env.Logger.Info("Movies ingested successfully into Qdrant", "count", len(movieEmbeddings))
	}

	if err := updateMoviesExistInSearch(movies, env); err != nil {
		env.Logger.Error("Failed to update movies in DB", "error", err.Error())
	} else {
		env.Logger.Info("Movies updated successfully in DB", "count", len(movies))
	}
}
