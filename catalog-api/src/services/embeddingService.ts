import type { RedisClient } from "bun";
import cacheService from "./cacheService";

const getEmbedding = async (inputs: string): Promise<number[]> => {
  if (inputs.length === 0) return [];

  const response = await fetch(
    process.env.EMBEDDING_SERVICE_URL || "http://localhost:8000/embed",
    {
      body: JSON.stringify({ inputs }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) return [];

  const embeddingsArray = (await response.json()) as number[][];
  if (
    !embeddingsArray ||
    !Array.isArray(embeddingsArray) ||
    !embeddingsArray.length
  )
    return [];

  const [result] = embeddingsArray;
  return result;
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
