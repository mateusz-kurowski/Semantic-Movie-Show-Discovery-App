import { cacheClient, qdrantClient } from "../clients";
import { getCollectionName } from "../models/envModel";
import embeddingService from "./openAIService";
import qdrantService from "./qdrantService";

const semanticSearch = async (phrase: string, topK: number) => {
	const embedding = await embeddingService.getEmbeddingWithCache(
		phrase,
		cacheClient,
	);

	return await qdrantService.semanticSearch(
		qdrantClient,
		getCollectionName(),
		embedding,
		topK,
	);
};

const hybridSearch = async (phrase: string, topK: number) => {
	const embedding = await embeddingService.getEmbeddingWithCache(
		phrase,
		cacheClient,
	);
	return await qdrantService.hybridSearch(
		qdrantClient,
		getCollectionName(),
		embedding,
		phrase,
		topK,
	);
};
export const searchService = { hybridSearch, semanticSearch };
