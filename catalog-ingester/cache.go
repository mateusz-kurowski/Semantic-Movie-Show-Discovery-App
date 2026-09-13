package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// embeddingCacheTTL bounds Redis memory: retries and reloads hit,
// steady-state single-ingest movies expire without manual invalidation.
const embeddingCacheTTL = 30 * 24 * time.Hour

const embeddingCacheKeyPrefix = "embed"

func createCacheClient(vars EnvVars) (*redis.Client, error) {
	opts, err := redis.ParseURL(vars.CacheURL)
	if err != nil {
		return nil, fmt.Errorf("parse cache URL: %w", err)
	}

	return redis.NewClient(opts), nil
}

// embeddingCacheKey versions the key by model and dimension so a model or
// dimension change never silently reuses stale vectors.
func embeddingCacheKey(model string, dimension int, text string) string {
	sum := sha256.Sum256([]byte(text))
	return fmt.Sprintf("%s:%s:%d:%x", embeddingCacheKeyPrefix, model, dimension, sum)
}

func getEmbeddingsFromCache(
	ctx context.Context,
	texts []string,
	model string,
	dimension int,
	cacheClient *redis.Client,
) (map[string][]float32, []string, error) {
	embeddings := make(map[string][]float32)
	notCached := []string{}

	if len(texts) == 0 {
		return embeddings, notCached, nil
	}

	keys := make([]string, len(texts))
	for i, text := range texts {
		keys[i] = embeddingCacheKey(model, dimension, text)
	}

	// Single round-trip for the whole batch.
	values, err := cacheClient.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, notCached, err
	}

	if len(values) != len(texts) {
		return nil, notCached, fmt.Errorf(
			"cache lookup: expected %d results, got %d",
			len(texts),
			len(values),
		)
	}

	for i := range texts {
		text := texts[i]
		value := values[i]

		if value == nil {
			notCached = append(notCached, text)
			continue
		}

		raw, ok := value.(string)
		if !ok {
			return nil, notCached, fmt.Errorf("unexpected cached type %T for text %q", value, text)
		}

		var embeddingSlice []float32
		if unmarshalErr := json.Unmarshal([]byte(raw), &embeddingSlice); unmarshalErr != nil {
			return nil, notCached, unmarshalErr
		}

		embeddings[text] = embeddingSlice
	}

	return embeddings, notCached, nil
}

// setEmbeddingsInCache writes fresh OpenAI vectors with a TTL so future
// retries and reloads skip the API call.
func setEmbeddingsInCache(
	ctx context.Context,
	embeddings map[string][]float32,
	model string,
	dimension int,
	cacheClient *redis.Client,
) error {
	if len(embeddings) == 0 {
		return nil
	}

	pipe := cacheClient.Pipeline()
	for text, vector := range embeddings {
		raw, marshalErr := json.Marshal(vector)
		if marshalErr != nil {
			return marshalErr
		}

		pipe.Set(ctx, embeddingCacheKey(model, dimension, text), raw, embeddingCacheTTL)
	}

	_, err := pipe.Exec(ctx)

	return err
}
