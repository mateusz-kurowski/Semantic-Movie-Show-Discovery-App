package main

import (
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
)

type EnvVars struct {
	DatabaseURL      string `validate:"required,uri,startswith=postgres"`
	TmdbAPIKey       string `validate:"required"`
	OtelCollectorURL string `validate:"required"`
	OtelServiceName  string `validate:"required"`
}

func ReadAndValidateEnvs(validate *validator.Validate) (*EnvVars, error) {
	if err := godotenv.Load(); err != nil {
		return nil, err
	}
	env := EnvVars{
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		TmdbAPIKey:       os.Getenv("TMDB_API_KEY"),
		OtelCollectorURL: os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"),
		OtelServiceName:  os.Getenv("OTEL_SERVICE_NAME"),
	}
	if err := validate.Struct(&env); err != nil {
		return nil, err
	}
	return &env, nil
}
