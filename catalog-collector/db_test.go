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

	postgresC, errRunCt := testcontainers.Run(ctx, "postgres:18",
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

	if errRunCt != nil {
		t.Fatalf("Nie udało się uruchomić kontenera PostgreSQL: %v", errRunCt)
	}

	defer func() {
		if errTerminateCt := postgresC.Terminate(ctx); errTerminateCt != nil {
			t.Fatalf("Błąd podczas zamykania kontenera: %v", errTerminateCt)
		}
	}()

}

// func TestDBConnection(t *testing.T) {
// 	// ...
// }
