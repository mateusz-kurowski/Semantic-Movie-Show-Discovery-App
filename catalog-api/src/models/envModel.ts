import { Value } from "@sinclair/typebox/value";
import { env as bunEnv } from "bun";
import { type Static, t } from "elysia";

const envSchema = t.Object({
  collectionName: t.String({ minLength: 1 }),
  qdrantApiKey: t.String({ minLength: 1 }),
  qdrantDenseVectorName: t.String({
    minLength: 1,
    default: "overview-dense-vector",
  }),
  qdrantHost: t.String({ format: "hostname" }),
  qdrantPort: t.Number({ minimum: 1, default: 6334 }),
  qdrantSSL: t.Boolean({ default: false }),
  redisUrl: t.String({ format: "uri" }),
  openAIBaseUrl: t.String({ format: "uri" }),
  openAIKey: t.String({ minLength: 1 }),
  openAIEmbeddingModel: t.String({ minLength: 1 }),
  openAIEmbeddingModelDimension: t.Number({
    minimum: 1,
    default: 256,
    maximum: 1024,
  }),
});

export type Env = Static<typeof envSchema>;

export const validateEnvs = (): Env => {
  const envs = {
    collectionName: bunEnv.QDRANT_COLLECTION_NAME,
    qdrantApiKey: bunEnv.QDRANT_API_KEY,
    qdrantUrl: bunEnv.QDRANT_URL,
    qdrantHost: bunEnv.QDRANT_HOST || "qdrant.mkurowski.dev",
    qdrantPort: bunEnv.QDRANT_PORT ? parseInt(bunEnv.QDRANT_PORT, 10) : 6334,
    qdrantSSL: bunEnv.QDRANT_SSL === "true",
    qdrantDenseVectorName:
      bunEnv.QDRANT_DENSE_VECTOR_NAME || "overview-dense-vector",
    redisUrl: bunEnv.REDIS_URL,
    openAIBaseUrl: bunEnv.OPENAI_BASE_URL,
    openAIKey: bunEnv.OPENAI_API_KEY,
    openAIEmbeddingModel: bunEnv.OPENAI_EMBEDDING_MODEL,
    openAIEmbeddingModelDimension: bunEnv.OPENAI_EMBEDDING_MODEL_DIMENSION
      ? parseInt(bunEnv.OPENAI_EMBEDDING_MODEL_DIMENSION, 10)
      : 256,
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
