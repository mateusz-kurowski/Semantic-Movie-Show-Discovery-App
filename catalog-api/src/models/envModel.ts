import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";

const envSchema = t.Object({
  apiPort: t.Number({ default: 8080, minimum: 1 }),
  collectionName: t.String({ minLength: 1 }),
  openAIBaseUrl: t.String({ format: "uri" }),
  openAIEmbeddingModel: t.String({ minLength: 1 }),
  openAIEmbeddingModelDimension: t.Number({
    default: 256,
    maximum: 1024,
    minimum: 1,
  }),
  openAIKey: t.String({ minLength: 1 }),
  qdrantApiKey: t.String({ minLength: 1 }),
  qdrantDenseVectorName: t.String({
    default: "overview-dense-vector",
    minLength: 1,
  }),
  qdrantHost: t.String({ format: "hostname" }),
  qdrantPort: t.Number({ default: 6334, minimum: 1 }),
  qdrantSparseVectorName: t.String({
    default: "overview-sparse-vector",
    minLength: 1,
  }),
  qdrantSSL: t.Boolean({ default: false }),
  redisUrl: t.String({ format: "uri" }),
});

export type Env = Static<typeof envSchema>;

export const validateEnvs = (): Env => {
  const envs = {
    apiPort: process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 8080,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
    openAIBaseUrl: process.env.OPENAI_BASE_URL,
    openAIEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL,
    openAIEmbeddingModelDimension: process.env.OPENAI_EMBEDDING_MODEL_DIMENSION
      ? parseInt(process.env.OPENAI_EMBEDDING_MODEL_DIMENSION, 10)
      : 256,
    openAIKey: process.env.OPENAI_API_KEY,
    qdrantApiKey: process.env.QDRANT_API_KEY,
    qdrantDenseVectorName:
      process.env.QDRANT_DENSE_VECTOR_NAME || "overview-dense-vector",
    qdrantHost: process.env.QDRANT_HOST || "qdrant.mkurowski.dev",
    qdrantPort: process.env.QDRANT_PORT ? parseInt(process.env.QDRANT_PORT, 10) : 6334,
    qdrantSparseVectorName:
      process.env.QDRANT_SPARSE_VECTOR_NAME || "overview-sparse-vector",
    qdrantSSL: process.env.QDRANT_SSL === "true",
    qdrantUrl: process.env.QDRANT_URL,
    redisUrl: process.env.REDIS_URL,
  };

  const isValid = Value.Check(envSchema, envs);
  if (!isValid) {
    const errors = [...Value.Errors(envSchema, envs)];
    console.error("Environment variable validation failed:", errors);
    process.exit(1);
  }
  return envs as Env;
};

export const getEnvs = (): Env => {
  return validateEnvs();
};

export const env = validateEnvs();

export const getCollectionName = () => env.collectionName;
