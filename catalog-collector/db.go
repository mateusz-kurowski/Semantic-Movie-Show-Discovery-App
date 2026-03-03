package main

import (
	"database/sql"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/XSAM/otelsql"
	"go.opentelemetry.io/otel/attribute"
)

func connectDB(genv GlobalEnv, dbURL string) *sql.DB {
	db, err := otelsql.Open("pgx", dbURL, otelsql.WithAttributes(
		attribute.String("db.system", "postgresql"),
	))
	if err != nil {
		genv.Logger.Error("Connection to DB could not be established", "error", err)
		os.Exit(1)
	}
	if err := db.Ping(); err != nil {
		genv.Logger.Error("Connection to DB could not be established", "error", err)
		os.Exit(1)
	}
	return db
}
