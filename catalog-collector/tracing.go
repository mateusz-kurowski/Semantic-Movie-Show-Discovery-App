package main

import (
	"context"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(ctx context.Context, env GlobalEnv) (func(context.Context) error, error) {
	// The SDK reads OTEL_EXPORTER_OTLP_ENDPOINT from the environment automatically
	// and handles scheme parsing correctly — no need for an explicit WithEndpoint call.
	exporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return nil, err
	}

	// Reads OTEL_SERVICE_NAME from environment and adds host/process/OS attributes
	res, err := resource.New(ctx,
		resource.WithFromEnv(),
		resource.WithHost(),
		resource.WithOS(),
		resource.WithProcess(),
		resource.WithOSDescription(),
	)
	if err != nil {
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
	env.Logger.Info("Successfully connected to SigNoz")
	return tp.Shutdown, nil
}
