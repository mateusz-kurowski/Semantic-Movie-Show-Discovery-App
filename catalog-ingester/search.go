package main

import (
	"context"
	"sync"

	"github.com/qdrant/go-client/qdrant"
)

const maxConcurrentEmbeddings = 4

func initQdrant(vars EnvVars) (*qdrant.Client, error) {
	client, err := qdrant.NewClient(&qdrant.Config{
		APIKey: vars.QdrantAPIKey,
		Host:   vars.QdrantHost,
		Port:   vars.QdrantPort,
		UseTLS: vars.QdrantUseSSL,
	})
	return client, err
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
	return err
}

func getMoviesAndIngest(ctx context.Context, env GlobalEnv,
	qdrantClient *qdrant.Client, vars EnvVars) {
	movies, err := getMovies(ctx, env, vars)
	if err != nil {
		env.Logger.ErrorContext(ctx, "Failed to fetch movies from DB", "error", err.Error())
		return
	}

	if len(movies) == 0 {
		return
	}

	points, errProcess := processMovies(ctx, env, vars, movies)
	if errProcess != nil {
		env.Logger.ErrorContext(ctx, "Failed to process movie chunks", "error", errProcess.Error())
		return
	}

	errIngest := upsertPoints(ctx, qdrantClient, vars.QdrantCollectionName, points)
	if errIngest != nil {
		env.Logger.ErrorContext(ctx, "Failed to ingest movies into Qdrant", "error",
			errIngest.Error())
		return
	}

	env.Logger.InfoContext(ctx, "Movies ingested successfully into Qdrant", "points_count",
		len(points))

	errUpdate := updateMoviesExistInSearch(ctx, movies, env)
	if errUpdate != nil {
		env.Logger.ErrorContext(ctx, "Failed to update movies in DB", "error", errUpdate.Error())
		return
	}
	env.Logger.InfoContext(ctx, "Movies updated successfully in DB", "movies_count", len(movies))
}

func processMovies(ctx context.Context, env GlobalEnv, vars EnvVars, movies []Movie) ([]*qdrant.PointStruct, error) {
	var points []*qdrant.PointStruct
	var localChunks []Movie

	for _, m := range movies {
		env.Logger.DebugContext(ctx, "Processing movie", "id", m.ID, "title", m.Title)

		chunks := divideMovieIntoChunks(m)
		for _, chunkMovie := range chunks {
			if chunkMovie.Overview == nil {
				continue
			}

			if vars.UseQdrantInference {
				cloudPayload := chunkMovie.ToQdrantCloudPayload(*chunkMovie.Overview,
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

func processLocalChunks(ctx context.Context, vars EnvVars, localChunks []Movie) ([]*qdrant.PointStruct, error) {
	var points []*qdrant.PointStruct
	chunkSize := len(localChunks)
	batchSize := vars.IngestBatchSize
	if batchSize <= 0 {
		batchSize = 8
	}

	var mu sync.Mutex
	var wg sync.WaitGroup
	errCh := make(chan error, (chunkSize/batchSize)+1)

	// Limit concurrency to avoid connection timeouts
	sem := make(chan struct{}, maxConcurrentEmbeddings)

	for i := 0; i < chunkSize; i += batchSize {
		end := min(i+batchSize, chunkSize)
		batch := localChunks[i:end]

		wg.Add(1)
		go func(b []Movie) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			texts := make([]string, len(b))
			for j, chunkMovie := range b {
				texts[j] = *chunkMovie.Overview
			}

			embeddings, errGetEmb := GetEmbeddings(ctx, texts, vars)
			if errGetEmb != nil {
				errCh <- errGetEmb
				return
			}

			var localPoints []*qdrant.PointStruct
			for j, chunkMovie := range b {
				if j < len(embeddings) {
					localPoints = append(localPoints, chunkMovie.ToQdrantPayload(embeddings[j]))
				}
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
