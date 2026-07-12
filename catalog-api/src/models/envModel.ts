import { Value } from "@sinclair/typebox/value";
import { env as bunEnv } from "bun";
import { type Static, t } from "elysia";

const envSchema = t.Object({
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
		collectionName: bunEnv.QDRANT_COLLECTION_NAME,
		openAIBaseUrl: bunEnv.OPENAI_BASE_URL,
		openAIEmbeddingModel: bunEnv.OPENAI_EMBEDDING_MODEL,
		openAIEmbeddingModelDimension: bunEnv.OPENAI_EMBEDDING_MODEL_DIMENSION
			? parseInt(bunEnv.OPENAI_EMBEDDING_MODEL_DIMENSION, 10)
			: 256,
		openAIKey: bunEnv.OPENAI_API_KEY,
		qdrantApiKey: bunEnv.QDRANT_API_KEY,
		qdrantDenseVectorName:
			bunEnv.QDRANT_DENSE_VECTOR_NAME || "overview-dense-vector",
		qdrantHost: bunEnv.QDRANT_HOST || "qdrant.mkurowski.dev",
		qdrantPort: bunEnv.QDRANT_PORT ? parseInt(bunEnv.QDRANT_PORT, 10) : 6334,
		qdrantSparseVectorName:
			bunEnv.QDRANT_SPARSE_VECTOR_NAME || "overview-sparse-vector",
		qdrantSSL: bunEnv.QDRANT_SSL === "true",
		qdrantUrl: bunEnv.QDRANT_URL,
		redisUrl: bunEnv.REDIS_URL,
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
