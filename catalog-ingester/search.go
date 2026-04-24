package main

import (
	"catalog-ingester/internal/movie"
	"context"
	"fmt"
	"sync"

	"github.com/qdrant/go-client/qdrant"
)

const e5PassagePrefix = "passage: "

func toE5PassageInput(text string) string {
	return e5PassagePrefix + text
}

func initQdrant(ctx context.Context, env GlobalEnv, vars EnvVars) (*qdrant.Client, error) {
	env.Logger.Info("Initializing Qdrant client",
		"host", vars.QdrantHost,
		"port", vars.QdrantPort,
		"collection", vars.QdrantCollectionName,
		"vector_name", vars.QdrantDenseVectorName)
	
	client, err := qdrant.NewClient(&qdrant.Config{
		APIKey: vars.QdrantAPIKey,
		Host:   vars.QdrantHost,
		Port:   vars.QdrantPort,
		UseTLS: vars.QdrantUseSSL,
	})
	if err != nil {
		return nil, err
	}

	// Try to create collection - don't fail if it already exists
	env.Logger.Info("Creating collection if not exists", "collection", vars.QdrantCollectionName)
	err = client.CreateCollection(ctx, &qdrant.CreateCollection{
		CollectionName: vars.QdrantCollectionName,
		VectorsConfig: qdrant.NewVectorsConfigMap(map[string]*qdrant.VectorParams{
			vars.QdrantDenseVectorName: {
				Size:     384, // intfloat/multilingual-e5-small dimension
				Distance: qdrant.Distance_Cosine,
			},
		}),
	})
	if err != nil {
		env.Logger.Warn("Collection creation returned error (may already exist)", "error", err.Error())
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
		return nil
	}
	wait := true
	_, err := client.Upsert(ctx, &qdrant.UpsertPoints{
		CollectionName: collectionName,
		Points:         points,
		Wait:           &wait,
	})
	if err != nil {
		return fmt.Errorf("Upsert() failed: %s: %w", collectionName, err)
	}
	return err
}

func getMoviesAndIngest(ctx context.Context, env GlobalEnv,
	qdrantClient *qdrant.Client, vars EnvVars) int {
	movies, err := movie.GetMovies(ctx, env.DB, env.Logger, vars.IngestBatchSize)
	if err != nil {
		env.Logger.ErrorContext(ctx, "Failed to fetch movies from DB", "error", err.Error())
		return 0
	}

	if len(movies) == 0 {
		return 0
	}

	points, errProcess := processMovies(ctx, env, vars, movies)
	if errProcess != nil {
		env.Logger.ErrorContext(ctx, "Failed to process movie chunks", "error", errProcess.Error())
		return 0
	}

	errIngest := upsertPoints(ctx, qdrantClient, vars.QdrantCollectionName, points)
	if errIngest != nil {
		env.Logger.ErrorContext(ctx, "Failed to ingest movies into Qdrant",
			"collection", vars.QdrantCollectionName,
			"vector_name", vars.QdrantDenseVectorName,
			"points_count", len(points),
			"error", errIngest.Error())
		return 0
	}

	env.Logger.InfoContext(ctx, "Movies ingested successfully into Qdrant", "points_count",
		len(points))

	errUpdate := movie.UpdateMoviesExistInSearch(ctx, movies, env.DB, env.Logger)
	if errUpdate != nil {
		env.Logger.ErrorContext(ctx, "Failed to update movies in DB", "error", errUpdate.Error())
		return 0
	}
	env.Logger.InfoContext(ctx, "Movies updated successfully in DB", "movies_count", len(movies))

	return len(movies)
}

func processMovies(ctx context.Context, env GlobalEnv, vars EnvVars, movies []movie.Movie) ([]*qdrant.PointStruct, error) {
	var points []*qdrant.PointStruct
	var localChunks []movie.Movie

	for _, m := range movies {
		env.Logger.DebugContext(ctx, "Processing movie", "id", m.ID, "title", m.Title)

		chunks := divideMovieIntoChunks(m)
		for _, chunkMovie := range chunks {
			if chunkMovie.SemanticText == "" {
				continue
			}

			if vars.UseQdrantInference {
				cloudPayload := chunkMovie.ToQdrantCloudPayload(chunkMovie.SemanticText,
					vars.QdrantInferenceModel, vars.QdrantDenseVectorName)
				points = append(points, cloudPayload)
			} else {
				localChunks = append(localChunks, chunkMovie)
			}
		}
	}

	if !vars.UseQdrantInference && len(localChunks) > 0 {
		localPoints, err := processLocalChunks(ctx, vars, localChunks)
		if err != nil {
			return nil, err
		}
		points = append(points, localPoints...)
	}

	return points, nil
}

func processBatch(ctx context.Context, vars EnvVars, b []movie.Movie) ([]*qdrant.PointStruct, error) {
	var texts []string
	var validB []movie.Movie
	for _, chunkMovie := range b {
		text := chunkMovie.SemanticText
		if text != "" {
			texts = append(texts, toE5PassageInput(text))
			validB = append(validB, chunkMovie)
		}
	}

	if len(texts) == 0 {
		return nil, nil
	}

	embeddings, errGetEmb := GetEmbeddings(ctx, texts, vars)
	if errGetEmb != nil {
		return nil, errGetEmb
	}

	var localPoints []*qdrant.PointStruct
	for j, chunkMovie := range validB {
		if j < len(embeddings) {
			localPoints = append(localPoints, chunkMovie.ToQdrantPayload(embeddings[j], vars.QdrantDenseVectorName))
		}
	}

	return localPoints, nil
}

func processLocalChunks(ctx context.Context, vars EnvVars, localChunks []movie.Movie) ([]*qdrant.PointStruct, error) {
	var points []*qdrant.PointStruct
	chunkSize := len(localChunks)
	batchSize := vars.IngestBatchSize
	if batchSize <= 0 {
		batchSize = 8
	}

	var mu sync.Mutex
	var wg sync.WaitGroup
	errCh := make(chan error, (chunkSize/batchSize)+1)

	maxConcurrentEmbeddings := vars.EmbeddingMaxParallel
	if maxConcurrentEmbeddings <= 0 {
		maxConcurrentEmbeddings = 2
	}
	// Limit concurrency to avoid connection timeouts
	sem := make(chan struct{}, maxConcurrentEmbeddings)

	for i := 0; i < chunkSize; i += batchSize {
		end := min(i+batchSize, chunkSize)
		batch := localChunks[i:end]

		wg.Add(1)
		go func(b []movie.Movie) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			localPoints, err := processBatch(ctx, vars, b)
			if err != nil {
				errCh <- err
				return
			}

			mu.Lock()
			points = append(points, localPoints...)
			mu.Unlock()
		}(batch)
	}

	wg.Wait()
	close(errCh)

	for err := range errCh {
		if err != nil {
			return nil, err
		}
	}

	return points, nil
}
