package main

import (
	"context"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/packages/param"
	"go.opentelemetry.io/otel/attribute"
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
	ctx, span := startObservation(ctx, "embed-semantic-texts", "embedding",
		attribute.String("gen_ai.request.model", vars.OpenAiEmbeddingModel),
		attribute.Int("langfuse.observation.metadata.dimension", vars.VectorDimension),
		attribute.Int("langfuse.observation.metadata.input_count", len(inputs)),
	)
	defer span.End()

	setSpanJSON(span, attrObservationInput, inputs)

	resp, err := client.Embeddings.New(ctx, openai.EmbeddingNewParams{
		Input:      openai.EmbeddingNewParamsInputUnion{OfArrayOfStrings: inputs},
		Model:      vars.OpenAiEmbeddingModel,
		Dimensions: param.Opt[int64]{Value: int64(vars.VectorDimension)},
	})
	if err != nil {
		recordSpanError(span, err)

		return nil, err
	}

	span.SetAttributes(
		attribute.String("gen_ai.response.model", resp.Model),
		attribute.Int64("gen_ai.usage.input_tokens", resp.Usage.PromptTokens),
	)
	setSpanJSON(span, attrObservationOutput,
		map[string]int{"embeddings": len(resp.Data), "dimension": vars.VectorDimension})

	return resp, nil
}
