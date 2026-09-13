package main

import (
	"reflect"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

const (
	testCacheModel     = "voyage/voyage-4-lite"
	testCacheDimension = 256
)

// setupTestCache starts an in-memory Redis and seeds it via the real write
// path so tests exercise the same key format and encoding as production.
func setupTestCache(t *testing.T, seed map[string][]float32) *redis.Client {
	t.Helper()

	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{
		Addr: server.Addr(),
	})

	if err := setEmbeddingsInCache(t.Context(), seed, testCacheModel, testCacheDimension, client); err != nil {
		t.Fatalf("seed cache: %v", err)
	}

	return client
}

func getFromTestCache(t *testing.T, texts []string, client *redis.Client) (map[string][]float32, []string) {
	t.Helper()

	embeddings, notCached, err := getEmbeddingsFromCache(
		t.Context(),
		texts,
		testCacheModel,
		testCacheDimension,
		client,
	)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	return embeddings, notCached
}

func TestCreateCacheClient(t *testing.T) {
	t.Parallel()

	t.Run("parses a full redis URL", func(t *testing.T) {
		t.Parallel()

		vars := EnvVars{CacheURL: "redis://default:secret@localhost:6379/1"}
		client, err := createCacheClient(vars)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		defer func() { _ = client.Close() }()

		if client.Options().Addr != "localhost:6379" {
			t.Fatalf("expected Addr %q, got %q", "localhost:6379", client.Options().Addr)
		}

		if client.Options().DB != 1 {
			t.Fatalf("expected DB 1, got %d", client.Options().DB)
		}
	})

	t.Run("returns error for an invalid URL", func(t *testing.T) {
		t.Parallel()

		vars := EnvVars{CacheURL: "://bad-url"}
		if _, err := createCacheClient(vars); err == nil {
			t.Fatal("expected URL parse error, got nil")
		}
	})
}

func TestEmbeddingCacheKey(t *testing.T) {
	t.Parallel()

	t.Run("is deterministic for the same input", func(t *testing.T) {
		t.Parallel()
		first := embeddingCacheKey(testCacheModel, testCacheDimension, "hello world")
		second := embeddingCacheKey(testCacheModel, testCacheDimension, "hello world")

		if first != second {
			t.Fatalf("expected deterministic key, got %q and %q", first, second)
		}

		if !strings.HasPrefix(first, "embed:") {
			t.Fatalf("expected embed: prefix, got %q", first)
		}
	})

	t.Run("changes when model or dimension changes", func(t *testing.T) {
		t.Parallel()
		base := embeddingCacheKey(testCacheModel, testCacheDimension, "hello world")
		otherModel := embeddingCacheKey("other-model", testCacheDimension, "hello world")
		otherDim := embeddingCacheKey(testCacheModel, 512, "hello world")

		if base == otherModel {
			t.Fatalf("expected different key for other model, got %q", base)
		}

		if base == otherDim {
			t.Fatalf("expected different key for other dimension, got %q", base)
		}
	})

	t.Run("does not leak raw text", func(t *testing.T) {
		t.Parallel()
		key := embeddingCacheKey(testCacheModel, testCacheDimension, "secret overview text")

		if strings.Contains(key, "secret overview text") {
			t.Fatalf("expected hashed key, got %q", key)
		}
	})
}

func TestGetEmbeddingsFromCache(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name            string
		seed            map[string][]float32
		texts           []string
		expectedFound   map[string][]float32
		expectedMissing []string
	}{
		{
			name:            "empty input returns empty result",
			seed:            nil,
			texts:           nil,
			expectedFound:   map[string][]float32{},
			expectedMissing: []string{},
		},
		{
			name: "all cached texts return embeddings",
			seed: map[string][]float32{
				"hello world": {1, 2, 3},
				"foo bar":     {4, 5, 6},
			},
			texts: []string{"hello world", "foo bar"},
			expectedFound: map[string][]float32{
				"hello world": {1, 2, 3},
				"foo bar":     {4, 5, 6},
			},
			expectedMissing: []string{},
		},
		{
			name: "splits cached and missing texts",
			seed: map[string][]float32{
				"cached text": {0.1, 0.2, 0.3},
			},
			texts: []string{"cached text", "missing one", "missing two"},
			expectedFound: map[string][]float32{
				"cached text": {0.1, 0.2, 0.3},
			},
			expectedMissing: []string{"missing one", "missing two"},
		},
		{
			name:            "empty cache marks everything missing",
			seed:            nil,
			texts:           []string{"one", "two"},
			expectedFound:   map[string][]float32{},
			expectedMissing: []string{"one", "two"},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			client := setupTestCache(t, tc.seed)

			embeddings, notCached := getFromTestCache(t, tc.texts, client)

			if !reflect.DeepEqual(embeddings, tc.expectedFound) {
				t.Fatalf("expected embeddings %v, got %v", tc.expectedFound, embeddings)
			}

			if !reflect.DeepEqual(notCached, tc.expectedMissing) {
				t.Fatalf("expected missing %v, got %v", tc.expectedMissing, notCached)
			}
		})
	}
}

func TestGetEmbeddingsFromCacheCorruptJSON(t *testing.T) {
	t.Parallel()

	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})

	badKey := embeddingCacheKey(testCacheModel, testCacheDimension, "bad text")
	if err := server.Set(badKey, "this is not json"); err != nil {
		t.Fatalf("seed corrupt value: %v", err)
	}

	_, _, err := getEmbeddingsFromCache(
		t.Context(),
		[]string{"bad text"},
		testCacheModel,
		testCacheDimension,
		client,
	)
	if err == nil {
		t.Fatal("expected JSON error, got nil")
	}
}

func TestGetEmbeddingsFromCacheRedisError(t *testing.T) {
	t.Parallel()

	// Force every Redis command to fail without TCP dial retries.
	server := miniredis.RunT(t)
	server.SetError("redis boom")
	client := redis.NewClient(&redis.Options{Addr: server.Addr(), MaxRetries: 0})
	defer func() { _ = client.Close() }()

	_, _, err := getEmbeddingsFromCache(
		t.Context(),
		[]string{"anything"},
		testCacheModel,
		testCacheDimension,
		client,
	)
	if err == nil {
		t.Fatal("expected connection error, got nil")
	}
}

func TestSetEmbeddingsInCache(t *testing.T) {
	t.Parallel()

	t.Run("round-trips through get", func(t *testing.T) {
		t.Parallel()
		server := miniredis.RunT(t)
		client := redis.NewClient(&redis.Options{Addr: server.Addr()})

		seed := map[string][]float32{"hello": {1, 2, 3}}
		if err := setEmbeddingsInCache(t.Context(), seed, testCacheModel, testCacheDimension, client); err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		embeddings, notCached := getFromTestCache(t, []string{"hello"}, client)

		if !reflect.DeepEqual(embeddings, seed) {
			t.Fatalf("expected %v, got %v", seed, embeddings)
		}

		if len(notCached) != 0 {
			t.Fatalf("expected nothing missing, got %v", notCached)
		}
	})

	t.Run("sets a TTL on cached keys", func(t *testing.T) {
		t.Parallel()
		server := miniredis.RunT(t)
		client := redis.NewClient(&redis.Options{Addr: server.Addr()})

		if err := setEmbeddingsInCache(
			t.Context(),
			map[string][]float32{"hello": {1}},
			testCacheModel,
			testCacheDimension,
			client,
		); err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		ttl, err := client.TTL(
			t.Context(),
			embeddingCacheKey(testCacheModel, testCacheDimension, "hello"),
		).Result()
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if ttl <= 0 {
			t.Fatalf("expected positive TTL, got %v", ttl)
		}
	})

	t.Run("empty input is a no-op", func(t *testing.T) {
		t.Parallel()
		server := miniredis.RunT(t)
		client := redis.NewClient(&redis.Options{Addr: server.Addr()})

		if err := setEmbeddingsInCache(t.Context(), nil, testCacheModel, testCacheDimension, client); err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if keys := server.Keys(); len(keys) != 0 {
			t.Fatalf("expected no keys, got %v", keys)
		}
	})
}

func TestEmbeddingsCacheVersionIsolation(t *testing.T) {
	t.Parallel()

	client := setupTestCache(t, map[string][]float32{"hello": {1, 2, 3}})

	otherModel := "other-model"
	otherVector := map[string][]float32{"hello": {9}}
	if err := setEmbeddingsInCache(t.Context(), otherVector, otherModel, testCacheDimension, client); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	embeddings, notCached := getFromTestCache(t, []string{"hello"}, client)
	if len(notCached) != 0 {
		t.Fatalf("expected hit, got missing %v", notCached)
	}

	if !reflect.DeepEqual(embeddings, map[string][]float32{"hello": {1, 2, 3}}) {
		t.Fatalf("expected base model vector, got %v", embeddings)
	}

	otherEmbeddings, _, err := getEmbeddingsFromCache(
		t.Context(),
		[]string{"hello"},
		otherModel,
		testCacheDimension,
		client,
	)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if !reflect.DeepEqual(otherEmbeddings, otherVector) {
		t.Fatalf("expected other model vector %v, got %v", otherVector, otherEmbeddings)
	}
}
