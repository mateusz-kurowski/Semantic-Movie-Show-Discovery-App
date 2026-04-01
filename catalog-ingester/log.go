package main

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/sdk/log"
)

func createLogger(ctx context.Context, otlpEndpoint, serviceName string) (*slog.Logger, func(), error) {
	exporter, err := createExporter(ctx, otlpEndpoint)
	if err != nil {
		return nil, nil, err
	}
	processor := log.NewBatchProcessor(exporter)

	provider, shutdownFunc := createProvider(processor)
	logger := otelslog.NewLogger(serviceName, otelslog.WithLoggerProvider(provider))
	return logger, shutdownFunc, nil
}

func createExporter(ctx context.Context, otlpEndpoint string) (*otlploghttp.Exporter, error) {
	opts := []otlploghttp.Option{
		otlploghttp.WithInsecure(),
	}
	if otlpEndpoint != "" {
		endpoint := strings.TrimSuffix(otlpEndpoint, "/")
		if !strings.HasSuffix(endpoint, "/v1/logs") {
			endpoint += "/v1/logs"
		}
		opts = append(opts, otlploghttp.WithEndpointURL(endpoint))
	}

	exporter, err := otlploghttp.New(ctx, opts...)
	if err != nil {
		return nil, err
	}
	return exporter, nil
}

func createProvider(processor *log.BatchProcessor) (*log.LoggerProvider, func()) {
	provider := log.NewLoggerProvider(
		log.WithProcessor(processor),
	)

	return provider, func() {
		err := provider.Shutdown(context.Background())
		if err != nil {
			fmt.Println(err)
		}
	}
}
