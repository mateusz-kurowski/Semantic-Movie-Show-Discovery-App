package main

import (
	"context"
	"database/sql"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/XSAM/otelsql"
	"go.opentelemetry.io/otel/attribute"
)

func connectDB(ctx context.Context, genv GlobalEnv, dbURL string) *sql.DB {
	db, connectionErr := otelsql.Open("pgx", dbURL, otelsql.WithAttributes(
		attribute.String("db.system", "postgresql"),
	))
	if connectionErr != nil {
		genv.Logger.Error("Connection to DB could not be established", "error", connectionErr)
		os.Exit(1)
	}
	if pingErr := db.PingContext(ctx); pingErr != nil {
		genv.Logger.Error("Connection to DB could not be established", "error", pingErr)
		os.Exit(1)
	}
	genv.Logger.Info("Successfully connected to DB")
	return db
}
