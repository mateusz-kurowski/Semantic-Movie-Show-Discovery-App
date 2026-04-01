package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	truncateDimDefault = 512
	defaultTimeout     = 10 * time.Second
)

var httpClient = &http.Client{
	Timeout: defaultTimeout,
}

func GetEmbeddings(ctx context.Context, text string, env EnvVars) ([]float32, error) {
	payload, _ := json.Marshal(map[string]any{
		"inputs":       text,
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

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	defer io.Copy(io.Discard, resp.Body)

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

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	// Guard against empty responses
	if len(result) == 0 {
		return nil, fmt.Errorf("received empty embedding array")
	}

	// Return the first vector from the batch
	return result[0], nil
}
