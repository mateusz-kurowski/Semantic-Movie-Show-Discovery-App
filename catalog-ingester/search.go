package main

import (
	"context"

	"github.com/qdrant/go-client/qdrant"
)

func initQdrant(vars EnvVars) (*qdrant.Client, error) {
	client, err := qdrant.NewClient(&qdrant.Config{
		APIKey: vars.QdrantAPIKey,
		Host:   vars.QdrantHost,
		Port:   vars.QdrantPort,
		UseTLS: true,
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

	var points []*qdrant.PointStruct

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
				continue
			}

			chunkEmbedding, errGetEmb := GetEmbeddings(ctx, *chunkMovie.Overview, vars)
			if errGetEmb != nil {
				env.Logger.ErrorContext(ctx, "Failed to get embeddings", "error",
					errGetEmb.Error())
				return
			}

			points = append(points, chunkMovie.ToQdrantPayload(chunkEmbedding))
		}
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
