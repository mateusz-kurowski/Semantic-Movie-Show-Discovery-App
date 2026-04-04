package main

import (
	"log/slog"

	slogGorm "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/plugin/opentelemetry/tracing"
)

const (
	defaultMaxOpenCons  = 100
	defaultMaxIdleConns = 10
)

func initDB(logger *slog.Logger, dsn string) (*gorm.DB, error) {
	gormLogger := slogGorm.New(
		slogGorm.WithHandler(logger.Handler()),
		slogGorm.WithTraceAll(), // to log all queries
	)

	db, openErr := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if openErr != nil {
		return nil, openErr
	}

	// Add OpenTelemetry tracing plugin to instrument all operations
	if err := db.Use(tracing.NewPlugin()); err != nil {
		return nil, err
	}
	// Set connection pool
	sqlDB, connErr := db.DB()
	if connErr != nil {
		return nil, connErr
	}

	sqlDB.SetMaxIdleConns(defaultMaxIdleConns)
	sqlDB.SetMaxOpenConns(defaultMaxOpenCons)

	return db, nil
}
