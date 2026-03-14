package main

import (
	"context"
	"fmt"

	"go.opentelemetry.io/contrib/bridges/otelzap"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/sdk/log"
	"go.uber.org/zap"
)

// initLogger creates a zap logger backed by an OTel log provider.
// It returns the logger, a cleanup function to flush/shutdown resources, and any error.
func initLogger(ctx context.Context, envVars *EnvVars) (*zap.Logger, func(context.Context) error, error) {
	// The SDK reads OTEL_EXPORTER_OTLP_ENDPOINT from the environment automatically
	// and handles scheme parsing correctly — no need for an explicit WithEndpoint call.
	exporter, err := otlploghttp.New(ctx,
		otlploghttp.WithInsecure(),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("%w:%v", errCreatingOTLPExporterError, err.Error())
	}

	provider := log.NewLoggerProvider(
		log.WithProcessor(log.NewBatchProcessor(exporter)),
	)

	logger := zap.New(otelzap.NewCore(envVars.OtelServiceName,
		otelzap.WithLoggerProvider(provider)))

	cleanup := func(ctx context.Context) error {
		_ = logger.Sync()
		return provider.Shutdown(ctx)
	}

	return logger, cleanup, nil
}
