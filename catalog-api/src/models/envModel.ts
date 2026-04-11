import { Value } from "@sinclair/typebox/value";
import { env as bunEnv } from "bun";
import { t, type Static } from "elysia";

const envSchema = t.Object({
	collectionName: t.String({ minLength: 1 }),
	embeddingServiceUrl: t.String({ format: "uri" }),
	otelTracesExporter: t.Optional(t.String()),
	qdrantApiKey: t.String({ minLength: 1 }),
	qdrantUrl: t.String({ format: "uri" }),
	qdrantDenseVectorName: t.String({
		minLength: 1,
		default: "overview-dense-vector",
	}),
	redisUrl: t.String({ format: "uri" }),
});

export type Env = Static<typeof envSchema>;

export const validateEnvs = (): Env => {
	const envs = {
		collectionName: bunEnv.QDRANT_COLLECTION_NAME,
		embeddingServiceUrl: bunEnv.EMBEDDING_SERVICE_URL,
		otelTracesExporter: bunEnv.OTEL_TRACES_EXPORTER,
		qdrantApiKey: bunEnv.QDRANT_API_KEY,
		qdrantUrl: bunEnv.QDRANT_URL,
		qdrantDenseVectorName:
			bunEnv.QDRANT_DENSE_VECTOR_NAME || "overview-dense-vector",
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
