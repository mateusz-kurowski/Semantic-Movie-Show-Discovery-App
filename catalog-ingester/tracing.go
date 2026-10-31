package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.40.0"
	"go.opentelemetry.io/otel/trace"
)

const tracerName = "catalog-ingester"

// Langfuse maps these OTel attributes onto its observation model.
const (
	attrObservationType   = "langfuse.observation.type"
	attrObservationInput  = "langfuse.observation.input"
	attrObservationOutput = "langfuse.observation.output"
	attrTraceName         = "langfuse.trace.name"
	attrEnvironment       = "langfuse.environment"
)

// initTracing exports spans to Langfuse over OTLP/HTTP. The exporter reads the
// standard OTEL_EXPORTER_OTLP_ENDPOINT / OTEL_EXPORTER_OTLP_HEADERS variables
// (Langfuse needs Basic auth plus x-langfuse-ingestion-version=4), so tracing
// stays off, with a no-op tracer, when no endpoint is configured.
func initTracing(ctx context.Context) (func(context.Context) error, error) {
	if os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT") == "" &&
		os.Getenv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT") == "" {
		return func(context.Context) error { return nil }, nil
	}

	exporter, err := otlptracehttp.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("create OTLP trace exporter: %w", err)
	}

	res, err := resource.Merge(resource.Default(), resource.NewSchemaless(
		semconv.ServiceName(tracerName),
		attribute.String(attrEnvironment, os.Getenv("LANGFUSE_TRACING_ENVIRONMENT")),
	))
	if err != nil {
		return nil, fmt.Errorf("build tracing resource: %w", err)
	}

	provider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(provider)

	return provider.Shutdown, nil
}

//nolint:spancheck // the caller owns the span and ends it.
func startObservation(
	ctx context.Context, name, observationType string, attrs ...attribute.KeyValue,
) (context.Context, trace.Span) {
	ctx, span := otel.Tracer(tracerName).Start(ctx, name)
	span.SetAttributes(attribute.String(attrObservationType, observationType))
	span.SetAttributes(attrs...)

	return ctx, span
}

func setSpanJSON(span trace.Span, key string, value any) {
	if encoded, err := json.Marshal(value); err == nil {
		span.SetAttributes(attribute.String(key, string(encoded)))
	}
}

func recordSpanError(span trace.Span, err error) {
	span.RecordError(err)
	span.SetStatus(codes.Error, err.Error())
	span.SetAttributes(attribute.String("langfuse.observation.level", "ERROR"))
}

func startIngestSpan(ctx context.Context, movies []Movie) (context.Context, func(error)) {
	ctx, span := startObservation(ctx, "ingest-batch", "span",
		attribute.String(attrTraceName, "ingest-batch"),
		attribute.Int("langfuse.observation.metadata.movie_count", len(movies)),
	)
	setSpanJSON(span, attrObservationInput, map[string]any{"movie_ids": GetMovieIDs(movies)})

	return ctx, func(err error) {
		if err != nil {
			recordSpanError(span, err)
		}
		span.End()
	}
}
