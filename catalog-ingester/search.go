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
		UseTLS: false,
	})
	return client, err
}

func ingestMovies(
	ctx context.Context,
	client *qdrant.Client,
	collectionName string,
	movies []MovieEmbedding,
) error {
	var points []*qdrant.PointStruct
	for _, me := range movies {
		points = append(points, me.Movie.ToQdrantPayload(me.Embedding))
	}
	wait := true
	_, err := client.Upsert(ctx, &qdrant.UpsertPoints{
		CollectionName: collectionName,
		Points:         points,
		Wait:           &wait,
	})
	return err
}
