import { embed } from "ai";
import type { RedisClient } from "bun";
import { createVoyage } from "voyage-ai-provider";
import { env } from "../models/envModel";
import cacheService from "./cacheService";

const voyageClient = createVoyage({
  baseURL: env.openAIBaseUrl,
  apiKey: env.openAIKey,
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
  cacheClient: RedisClient,
): Promise<number[]> => {
  const cached = await cacheService.getVector(cacheClient, phrase);
  if (cached) {
    console.log(`[EmbeddingService] Cache hit for phrase: "${phrase}"`);
    return cached;
  }

  console.log(`[EmbeddingService] Cache miss for phrase: "${phrase}"`);
  const embedding = await getEmbedding(phrase);
  if (embedding.length)
    await cacheService.setVector(cacheClient, phrase, embedding);

  return embedding;
};

const embeddingService = {
  getEmbedding,
  getEmbeddingWithCache,
};

export default embeddingService;
