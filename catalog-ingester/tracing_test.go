package main

import (
	"context"
	"errors"
	"testing"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"
)

func TestInitTracingDisabledWithoutEndpoint(t *testing.T) {
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "")
	t.Setenv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "")

	shutdown, err := initTracing(context.Background())
	if err != nil {
		t.Fatalf("initTracing: %v", err)
	}
	if err = shutdown(context.Background()); err != nil {
		t.Fatalf("shutdown: %v", err)
	}
}

func TestInitTracingEnabledWithEndpoint(t *testing.T) {
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://127.0.0.1:1")

	shutdown, err := initTracing(context.Background())
	if err != nil {
		t.Fatalf("initTracing: %v", err)
	}
	_ = shutdown(context.Background())
}

func TestObservationHelpers(t *testing.T) {
	t.Parallel()

	exporter := tracetest.NewInMemoryExporter()
	otel.SetTracerProvider(sdktrace.NewTracerProvider(sdktrace.WithSyncer(exporter)))

	_, span := startObservation(context.Background(), "embed-semantic-texts", "embedding",
		attribute.String("gen_ai.request.model", "m"))
	setSpanJSON(span, attrObservationInput, []string{"a"})
	recordSpanError(span, errors.New("boom"))
	span.End()

	spans := exporter.GetSpans()
	if len(spans) != 1 {
		t.Fatalf("expected 1 span, got %d", len(spans))
	}
	got := map[string]string{}
	for _, kv := range spans[0].Attributes {
		got[string(kv.Key)] = kv.Value.String()
	}
	if got[attrObservationType] != "embedding" || got[attrObservationInput] != `["a"]` ||
		got["langfuse.observation.level"] != "ERROR" {
		t.Fatalf("unexpected attributes: %v", got)
	}
	if spans[0].Status.Code != codes.Error {
		t.Fatalf("expected error status, got %v", spans[0].Status.Code)
	}
}
