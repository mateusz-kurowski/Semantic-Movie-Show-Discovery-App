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
	EmbeddingModelEndpoint string
	QdrantAPIKey           string
	QdrantHost             string `validate:"required"`
	QdrantPort             int    `validate:"required,gt=0"`
	QdrantCollectionName   string `validate:"required"`
	IngestPeriodSeconds    int    `validate:"required,gt=0"`
	Production             bool

	UseQdrantInference    bool
	QdrantInferenceModel  string
	QdrantDenseVectorName string `validate:"required"`
	IngestBatchSize       int
}

const defaultIngestBatchSize = 8

func ReadAndValidateEnvs(genv GlobalEnv) EnvVars {
	isProduction := os.Getenv("PRODUCTION") == "true"
	if !isProduction {
		// Ignore the error if no local .env files are found,
		// because docker-compose might be injecting env vars directly via env_file.
		_ = godotenv.Load(".env.development.local", ".env.development", ".env")
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

	ingestPeriodSeconds := os.Getenv("INGEST_PERIOD_SECONDS")
	ingestPeriodSecondsInt, err := strconv.Atoi(ingestPeriodSeconds)
	if err != nil {
		genv.Logger.Error("Error while converting INGEST_PERIOD_SECONDS to int.", "Error", err)
		os.Exit(1)
	}

	qdrantCollectionName := os.Getenv("QDRANT_COLLECTION_NAME")
	useQdrantInference := os.Getenv("USE_QDRANT_INFERENCE") == "true"
	qdrantInferenceModel := os.Getenv("QDRANT_INFERENCE_MODEL")

	ingestBatchSize := os.Getenv("INGEST_BATCH_SIZE")
	ingestBatchSizeInt, err := strconv.Atoi(ingestBatchSize)
	if err != nil {
		genv.Logger.Error("Error while converting INGEST_BATCH_SIZE to int.", "Error", err)
		ingestBatchSizeInt = defaultIngestBatchSize
	}

	env := EnvVars{
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		OtlpEndpoint:           os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"),
		ServiceName:            serviceName,
		EmbeddingModelEndpoint: os.Getenv("EMBEDDING_MODEL_ENDPOINT"),
		QdrantAPIKey:           os.Getenv("QDRANT_API_KEY"),
		QdrantHost:             os.Getenv("QDRANT_HOST"),
		QdrantPort:             qdrantPortInt,
		QdrantCollectionName:   qdrantCollectionName,
		IngestPeriodSeconds:    ingestPeriodSecondsInt,
		Production:             isProduction,
		UseQdrantInference:     useQdrantInference,
		QdrantInferenceModel:   qdrantInferenceModel,
		QdrantDenseVectorName:  os.Getenv("QDRANT_DENSE_VECTOR_NAME"),
		IngestBatchSize:        ingestBatchSizeInt,
	}
	if !env.UseQdrantInference && env.EmbeddingModelEndpoint == "" {
		genv.Logger.Error("EMBEDDING_MODEL_ENDPOINT is required when USE_QDRANT_INFERENCE is false.")
		os.Exit(1)
	}

	errVal := genv.Validate.Struct(&env)
	if errVal != nil {
		genv.Logger.Error("Environment variables validation failed.", "Error", errVal.Error())
		os.Exit(1)
	}
	return env
}
