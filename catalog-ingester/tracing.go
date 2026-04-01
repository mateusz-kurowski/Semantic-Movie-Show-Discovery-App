package main

import (
	"context"
	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(ctx context.Context, otlpEndpoint string) (func(context.Context) error, error) {
	opts := []otlptracehttp.Option{
		otlptracehttp.WithInsecure(),
	}
	if otlpEndpoint != "" {
		endpoint := strings.TrimSuffix(otlpEndpoint, "/")
		if !strings.HasSuffix(endpoint, "/v1/traces") {
			endpoint += "/v1/traces"
		}
		opts = append(opts, otlptracehttp.WithEndpointURL(endpoint))
	}

	exporter, err := otlptracehttp.New(ctx, opts...)
	if err != nil {
		return nil, err
	}

	// Reads OTEL_SERVICE_NAME from environment and adds host/process/OS attributes
	res, err := resource.New(ctx,

		resource.WithFromEnv(),
		resource.WithHost(),
		resource.WithOS(),
		resource.WithProcess(),
	)
	if err != nil {
		_ = exporter.Shutdown(ctx)
		return nil, err
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)

	// Makes the tracer available to instrumentation libraries
	otel.SetTracerProvider(tp)

	// Propagates trace context across service boundaries using W3C standards
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	return tp.Shutdown, nil
}
