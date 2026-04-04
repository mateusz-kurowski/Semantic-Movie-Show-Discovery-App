package main

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	DatabaseURL            string `validate:"required,uri,startswith=postgresql"`
	OtlpEndpoint           string
	ServiceName            string
	EmbeddingModelEndpoint string `validate:"required,uri"`
	QdrantAPIKey           string
	QdrantHost             string `validate:"required"`
	QdrantPort             int    `validate:"required,gt=0"`
	QdrantCollectionName   string `validate:"required"`
}

func ReadAndValidateEnvs(genv GlobalEnv) EnvVars {
	if err := godotenv.Load(); err != nil {
		genv.Logger.Error("Error while reading envs.", "Error", err)
	}

	serviceName := os.Getenv("OTEL_SERVICE_NAME")
	if serviceName == "" {
		serviceName = "catalog-ingester"
	}

	qdrantPort := os.Getenv("QDRANT_PORT")
	qdrantPortInt, err := strconv.Atoi(qdrantPort)
	if err != nil {
		genv.Logger.Error("Error while converting QDRANT_PORT to int.", "Error", err)
		os.Exit(1)
	}

	env := EnvVars{
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		OtlpEndpoint:           os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"),
		ServiceName:            serviceName,
		EmbeddingModelEndpoint: os.Getenv("EMBEDDING_MODEL_ENDPOINT"),
		QdrantAPIKey:           os.Getenv("QDRANT_API_KEY"),
		QdrantHost:             os.Getenv("QDRANT_HOST"),
		QdrantPort:             qdrantPortInt,
		QdrantCollectionName:   os.Getenv("QDRANT_COLLECTION_NAME"),
	}
	errVal := genv.Validate.Struct(&env)
	if errVal != nil {
		genv.Logger.Error("Environment variables validation failed.", "Error", errVal.Error())
		os.Exit(1)
	}
	return env
}
