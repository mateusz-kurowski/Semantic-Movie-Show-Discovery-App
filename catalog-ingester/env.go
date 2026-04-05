package main

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	DatabaseURL            string `validate:"required,uri,startswith=postgresql"`
	EmbeddingModelEndpoint string
	IngestBatchSize        int
	IngestPeriodSeconds    int `validate:"required,gt=0"`
	OtlpEndpoint           string
	Production             bool
	QdrantAPIKey           string
	QdrantCollectionName   string `validate:"required"`
	QdrantDenseVectorName  string `validate:"required"`
	QdrantHost             string `validate:"required"`
	QdrantInferenceModel   string
	QdrantPort             int `validate:"required,gt=0"`
	QdrantUseSSL           bool
	ServiceName            string
	UseQdrantInference     bool
}

const defaultIngestBatchSize = 8
const trueStr = "true"

func ReadAndValidateEnvs(genv GlobalEnv) EnvVars {
	isProduction := os.Getenv("PRODUCTION") == trueStr
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
	useQdrantInference := os.Getenv("USE_QDRANT_INFERENCE") == trueStr
	qdrantInferenceModel := os.Getenv("QDRANT_INFERENCE_MODEL")

	ingestBatchSize := os.Getenv("INGEST_BATCH_SIZE")
	ingestBatchSizeInt, err := strconv.Atoi(ingestBatchSize)
	if err != nil {
		genv.Logger.Error("Error while converting INGEST_BATCH_SIZE to int.", "Error", err)
		ingestBatchSizeInt = defaultIngestBatchSize
	}

	qdrantUseSSL := os.Getenv("QDRANT_USE_SSL") == trueStr

	env := EnvVars{
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		EmbeddingModelEndpoint: os.Getenv("EMBEDDING_MODEL_ENDPOINT"),
		IngestBatchSize:        ingestBatchSizeInt,
		IngestPeriodSeconds:    ingestPeriodSecondsInt,
		OtlpEndpoint:           os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"),
		Production:             isProduction,
		QdrantAPIKey:           os.Getenv("QDRANT_API_KEY"),
		QdrantCollectionName:   qdrantCollectionName,
		QdrantDenseVectorName:  os.Getenv("QDRANT_DENSE_VECTOR_NAME"),
		QdrantHost:             os.Getenv("QDRANT_HOST"),
		QdrantInferenceModel:   qdrantInferenceModel,
		QdrantPort:             qdrantPortInt,
		QdrantUseSSL:           qdrantUseSSL,
		ServiceName:            serviceName,
		UseQdrantInference:     useQdrantInference,
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
