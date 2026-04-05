package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	truncateDimDefault = 512
	fallbackTimeoutSec = 30
)

func GetEmbeddings(ctx context.Context, texts []string, env EnvVars) ([][]float32, error) {
	timeout := time.Duration(env.EmbeddingTimeoutSec) * time.Second
	if timeout <= 0 {
		timeout = fallbackTimeoutSec * time.Second
	}

	httpClient := &http.Client{
		Timeout: timeout,
	}

	payload, _ := json.Marshal(map[string]any{
		"inputs":       texts,
		"truncate_dim": truncateDimDefault,
	})

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		env.EmbeddingModelEndpoint,
		bytes.NewReader(payload),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	//nolint:gosec,nolintlint // SSRF is avoided as `env.EmbeddingModelEndpoint` is a trusted configured URL.
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	defer func() { _, _ = io.Copy(io.Discard, resp.Body) }()

	// ALWAYS check the status code before unmarshaling.
	// If TEI returns a 400/500, the body will be an error string/object,
	// which will also cause a JSON unmarshal crash if you don't catch it here!
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	// FIX: TEI returns a batch of vectors (even for a single input),
	// so the JSON looks like: [ [0.1, 0.2, 0.3...] ]
	var result [][]float32

	errDecode := json.NewDecoder(resp.Body).Decode(&result)
	if errDecode != nil {
		return nil, errDecode
	}

	// Guard against empty responses
	if len(result) == 0 {
		return nil, errors.New("received empty embedding array")
	}

	// Return the entire batch of vectors
	return result, nil
}
