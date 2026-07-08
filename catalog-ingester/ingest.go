package main

import (
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/qdrant/go-client/qdrant"
)

func runIngest(ctx context.Context, env GlobalEnv, qdrantClient *qdrant.Client,
	openaiClient openai.Client, vars EnvVars) (int, error) {
	count, ingestError := getMoviesAndIngest(ctx, env, qdrantClient, openaiClient, vars)

	if ingestError != nil {
		return 0, fmt.Errorf("failed to ingest movies: %w", ingestError)
	}
	return count, nil
}
