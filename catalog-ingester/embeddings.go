package main

import (
	"context"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/packages/param"
)

const voyage4Large = "voyage/voyage-4-lite"

func newOpenaiClient(env EnvVars) openai.Client {
	return openai.NewClient(
		option.WithAPIKey(env.OpenAiAPIKey),
		option.WithBaseURL(env.OpenAiBaseURL),
	)
}

func embedBatch(
	ctx context.Context,
	client openai.Client,
	vars EnvVars,
	inputs []string,
) (*openai.CreateEmbeddingResponse, error) {
	return client.Embeddings.New(ctx, openai.EmbeddingNewParams{
		Input:      openai.EmbeddingNewParamsInputUnion{OfArrayOfStrings: inputs},
		Model:      voyage4Large,
		Dimensions: param.Opt[int64]{Value: int64(vars.VectorDimension)},
	})
}
