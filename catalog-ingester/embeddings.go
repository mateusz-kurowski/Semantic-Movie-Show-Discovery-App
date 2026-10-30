package main

import (
	"context"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/packages/param"
)

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
		Model:      vars.OpenAiEmbeddingModel,
		Dimensions: param.Opt[int64]{Value: int64(vars.VectorDimension)},
	})
}
