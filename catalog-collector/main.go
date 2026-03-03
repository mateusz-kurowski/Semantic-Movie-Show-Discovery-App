package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/go-playground/validator/v10"
)

type GlobalEnv struct {
	Validate *validator.Validate
	Logger   *slog.Logger
}

func main() {
	env := GlobalEnv{
		Logger:   slog.New(slog.NewTextHandler(os.Stderr, nil)),
		Validate: validator.New(validator.WithRequiredStructEnabled()),
	}
	vars := ReadAndValidateEnvs(env)
	_ = connectDB(env, vars.DatabaseURL)
	ctx := context.Background()
	initTracer(ctx)
}
