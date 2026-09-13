package main

import (
	"context"
	"errors"
	"fmt"
	"maps"

	"github.com/openai/openai-go/v3"
	"github.com/qdrant/go-client/qdrant"
)

func initQdrant(ctx context.Context, env GlobalEnv, vars EnvVars) (*qdrant.Client, error) {
	env.Logger.InfoContext(ctx, "Initializing Qdrant client",
		"host", vars.QdrantHost,
		"port", vars.QdrantPort,
		"collection", vars.QdrantCollectionName,
		"vector_name", vars.QdrantDenseVectorName,
		"vector_dimension", vars.VectorDimension)

	client, err := qdrant.NewClient(&qdrant.Config{
		APIKey: vars.QdrantAPIKey,
		Host:   vars.QdrantHost,
		Port:   vars.QdrantPort,
		UseTLS: vars.QdrantUseSSL,
	})
	if err != nil {
		return nil, err
	}

	exists, err := client.CollectionExists(ctx, vars.QdrantCollectionName)
	if err != nil {
		return nil, err
	}
	if exists {
		env.Logger.InfoContext(ctx, "Collection exists", "collection", vars.QdrantCollectionName)
		return client, nil
	}

	env.Logger.InfoContext(ctx, "Creating collection", "collection", vars.QdrantCollectionName)
	if err = client.CreateCollection(ctx, &qdrant.CreateCollection{
		CollectionName: vars.QdrantCollectionName,
		VectorsConfig: qdrant.NewVectorsConfigMap(map[string]*qdrant.VectorParams{
			vars.QdrantDenseVectorName: {
				//nolint:gosec // dimension comes from config, not user input
				Size:     uint64(vars.VectorDimension),
				Distance: qdrant.Distance_Cosine,
			},
		}),
	}); err != nil {
		return nil, fmt.Errorf("create collection: %w", err)
	}
	return client, nil
}

func upsertPoints(
	ctx context.Context,
	client *qdrant.Client,
	collectionName string,
	points []*qdrant.PointStruct,
) error {
	if len(points) == 0 {
		return errors.New("no points to upsert")
	}
	wait := true
	_, err := client.Upsert(ctx, &qdrant.UpsertPoints{
		CollectionName: collectionName,
		Points:         points,
		Wait:           &wait,
	})
	if err != nil {
		return fmt.Errorf("upsert into %s: %w", collectionName, err)
	}
	return nil
}

func getMoviesAndIngest(ctx context.Context, env GlobalEnv,
	qdrantClient *qdrant.Client, openaiClient openai.Client, vars EnvVars) (int, error) {
	movies, err := getMovies(ctx, env.DB, env.Logger, vars.IngestBatchSize)
	if err != nil {
		return 0, fmt.Errorf("fetch movies from DB: %w", err)
	}
	if len(movies) == 0 {
		return 0, nil
	}

	semanticTexts := make([]string, len(movies))
	for i := range movies {
		semanticTexts[i] = movies[i].buildSemanticText()
	}

	//  Get embeddings from cache
	cacheEmbeddings, notCached, err := getEmbeddingsFromCache(
		ctx,
		semanticTexts,
		voyage4Large,
		vars.VectorDimension,
		env.CacheClient,
	)
	if err != nil {
		return 0, fmt.Errorf("get embeddings from cache: %w", err)
	}

	embeddings := make(map[string][]float32, len(semanticTexts))
	maps.Copy(embeddings, cacheEmbeddings)

	// Only embed texts missing from cache.
	uniqueToEmbed := dedupeStrings(notCached)
	env.Logger.InfoContext(ctx, "Embedding cache lookup",
		"cached", len(cacheEmbeddings),
		"openai_calls", len(uniqueToEmbed),
		"total", len(semanticTexts),
		"cache_db", env.CacheClient.Options().DB,
	)

	if len(uniqueToEmbed) > 0 {
		vectors, embedErr := embedBatch(ctx, openaiClient, vars, uniqueToEmbed)
		if embedErr != nil {
			return 0, fmt.Errorf("embed semantic texts: %w", embedErr)
		}

		if len(vectors.Data) != len(uniqueToEmbed) {
			return 0, fmt.Errorf(
				"embed semantic texts: expected %d embeddings, got %d",
				len(uniqueToEmbed),
				len(vectors.Data),
			)
		}

		fresh := make(map[string][]float32, len(uniqueToEmbed))
		for i, text := range uniqueToEmbed {
			fresh[text] = float64ArrayToFloat32(vectors.Data[i].Embedding)
		}

		maps.Copy(embeddings, fresh)

		// Best effort: ingest succeeds even if the cache write fails.
		if cacheErr := setEmbeddingsInCache(
			ctx,
			fresh,
			voyage4Large,
			vars.VectorDimension,
			env.CacheClient,
		); cacheErr != nil {
			env.Logger.WarnContext(ctx, "cache fresh embeddings", "error", cacheErr)
		}
	}

	points := make([]*qdrant.PointStruct, len(movies))
	for i, m := range movies {
		embedding, ok := embeddings[semanticTexts[i]]
		if !ok {
			return 0, fmt.Errorf("missing embedding for movie ID %d", m.ID)
		}

		points[i] = m.ToQdrantPayload(
			embedding,
			vars.QdrantDenseVectorName,
			vars.QdrantSparseVectorName,
		)
	}

	err = upsertPoints(ctx, qdrantClient, vars.QdrantCollectionName, points)
	if err != nil {
		return 0, fmt.Errorf("ingest into Qdrant: %w", err)
	}

	err = updateMoviesExistInSearch(ctx, movies, env.DB, env.Logger)
	if err != nil {
		return 0, fmt.Errorf("update movies in DB: %w", err)
	}

	return len(movies), nil
}
