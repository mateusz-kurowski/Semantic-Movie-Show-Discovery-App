package main

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5"
)

func connectDB(genv GlobalEnv, dbURL string) *pgx.Conn {
	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		genv.Logger.Error("Connection to DB could not be established")
		os.Exit(1)
	}
	return conn
}
