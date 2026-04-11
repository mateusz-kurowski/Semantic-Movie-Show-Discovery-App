import { cacheClient, qdrantClient } from "../clients";
import { getCollectionName } from "../models/envModel";
import embeddingService from "./embeddingService";
import qdrantService from "./qdrantService";

const search = async (phrase: string, topK: number) => {
  const embedding = await embeddingService.getEmbeddingWithCache(
    phrase,
    cacheClient,
  );

  const searchResults = await qdrantService.searchPoints(
    qdrantClient,
    getCollectionName(),
    embedding,
    topK,
  );

  return searchResults;
};
export const searchService = { search };
