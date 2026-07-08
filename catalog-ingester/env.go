package main

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	DatabaseURL           string `validate:"required,uri,startswith=postgresql"`
	IngestBatchSize       int
	IngestPeriodSeconds   int `validate:"gte=0"`
	Production            bool
	QdrantAPIKey          string
	QdrantCollectionName  string `validate:"required"`
	QdrantDenseVectorName string `validate:"required"`
	QdrantHost            string `validate:"required"`
	QdrantPort            int    `validate:"required,gt=0"`
	QdrantUseSSL          bool
	VectorDimension       int    `validate:"gte=1"`
	OpenAiAPIKey          string `validate:"required"`
	OpenAiBaseURL         string `validate:"required,url"`
}

const defaultIngestBatchSize = 8
const trueStr = "true"
const defaultVectorDimension = 256

const DefaultVectorDimension = defaultVectorDimension

func ReadAndValidateEnvs(genv GlobalEnv) EnvVars {
	isProduction := os.Getenv("PRODUCTION") == trueStr
	if !isProduction {
		if err := godotenv.Load(".env.development.local"); err != nil {
			genv.Logger.Debug("No .env.development.local file found, using host environment")
		}
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

	ingestBatchSize := os.Getenv("INGEST_BATCH_SIZE")
	ingestBatchSizeInt, err := strconv.Atoi(ingestBatchSize)
	if err != nil {
		genv.Logger.Error("Error while converting INGEST_BATCH_SIZE to int.", "Error", err)
		ingestBatchSizeInt = defaultIngestBatchSize
	}

	qdrantUseSSL := os.Getenv("QDRANT_USE_SSL") == trueStr

	vectorDimension := os.Getenv("VECTOR_DIMENSION")
	vectorDimensionInt, err := strconv.Atoi(vectorDimension)
	if err != nil || vectorDimensionInt <= 0 {
		vectorDimensionInt = defaultVectorDimension
	}

	env := EnvVars{
		DatabaseURL:           os.Getenv("DATABASE_URL"),
		IngestBatchSize:       ingestBatchSizeInt,
		IngestPeriodSeconds:   ingestPeriodSecondsInt,
		Production:            isProduction,
		QdrantAPIKey:          os.Getenv("QDRANT_API_KEY"),
		QdrantCollectionName:  qdrantCollectionName,
		QdrantDenseVectorName: os.Getenv("QDRANT_DENSE_VECTOR_NAME"),
		QdrantHost:            os.Getenv("QDRANT_HOST"),
		QdrantPort:            qdrantPortInt,
		QdrantUseSSL:          qdrantUseSSL,
		VectorDimension:       vectorDimensionInt,
		OpenAiAPIKey:          os.Getenv("OPENAI_API_KEY"),
		OpenAiBaseURL:         os.Getenv("OPENAI_BASE_URL"),
	}

	errVal := genv.Validate.Struct(&env)
	if errVal != nil {
		genv.Logger.Error("Environment variables validation failed.", "Error", errVal.Error())
		os.Exit(1)
	}

	genv.Logger.Info("Environment variables loaded",
		"PRODUCTION", isProduction,
		"QDRANT_COLLECTION_NAME", qdrantCollectionName,
		"QDRANT_DENSE_VECTOR_NAME", os.Getenv("QDRANT_DENSE_VECTOR_NAME"),
		"QDRANT_HOST", os.Getenv("QDRANT_HOST"),
		"QDRANT_PORT", qdrantPort,
		"VECTOR_DIMENSION", vectorDimensionInt,
	)
	return env
}
