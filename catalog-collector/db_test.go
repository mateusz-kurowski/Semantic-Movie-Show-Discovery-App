package main

import (
	"context"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestWithPostgres(t *testing.T) {
	ctx := context.Background()
	postgresPort := "5432/tcp"

	postgresC, err := testcontainers.Run(ctx, "postgres:18",
		testcontainers.WithExposedPorts(postgresPort),
		testcontainers.WithEnv(map[string]string{
			"POSTGRES_USER":     "user",
			"POSTGRES_PASSWORD": "password",
			"POSTGRES_DB":       "testdb",
		}),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(2*time.Minute),
		),
	)

	if err != nil {
		t.Fatalf("Nie udało się uruchomić kontenera PostgreSQL: %v", err)
	}

	defer func() {
		if err := postgresC.Terminate(ctx); err != nil {
			t.Fatalf("Błąd podczas zamykania kontenera: %v", err)
		}
	}()

}

func TestDBConnection(t *testing.T) {
	// ...
}
