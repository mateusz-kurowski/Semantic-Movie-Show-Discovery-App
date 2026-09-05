import { embed } from "ai";
import type { RedisClientType } from "redis";
import { createVoyage } from "voyage-ai-provider";
import { env } from "../models/envModel";
import cacheService from "./cacheService";

const voyageClient = createVoyage({
	baseURL: env.openAIBaseUrl,
	apiKey: env.openAIEmbeddingKey,
});

const getEmbedding = async (value: string) => {
	if (value.length === 0) return [];

	const response = await embed({
		model: voyageClient.embeddingModel(env.openAIEmbeddingModel),
		value,
		providerOptions: {
			voyage: {
				inputType: "query",
				outputDimension: env.openAIEmbeddingModelDimension,
			},
		},
	});
	return response.embedding;
};

const getEmbeddingWithCache = async (
	phrase: string,
	cacheClient: RedisClientType,
): Promise<number[]> => {
	let cached: number[] | null = null;
	try {
		cached = await cacheService.getVector(cacheClient, phrase);
	} catch (err) {
		console.warn(
			`[EmbeddingService] Cache read failed for phrase: "${phrase}", falling back to direct embedding...`,
			err,
		);
	}
	if (cached) {
		console.log(`[EmbeddingService] Cache hit for phrase: "${phrase}"`);
		return cached;
	}

	console.log(`[EmbeddingService] Cache miss for phrase: "${phrase}"`);
	const embedding = await getEmbedding(phrase);
	if (embedding.length) {
		try {
			await cacheService.setVector(cacheClient, phrase, embedding);
		} catch (err) {
			console.warn(
				`[EmbeddingService] Cache write failed for phrase: "${phrase}", skipping...`,
				err,
			);
		}
	}

	return embedding;
};

const embeddingService = {
	getEmbedding,
	getEmbeddingWithCache,
};

export default embeddingService;
