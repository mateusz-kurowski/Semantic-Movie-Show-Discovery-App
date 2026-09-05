import { cacheClient, qdrantClient } from "../clients";
import { getCollectionName } from "../models/envModel";
import embeddingService from "./openAIService";
import qdrantService, { type YearFilter } from "./qdrantService";

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

const hybridSearch = async (
	phrase: string,
	topK: number,
	yearFilter?: YearFilter,
) => {
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
		yearFilter,
	);
};
export const searchService = { hybridSearch, semanticSearch };
export type { YearFilter };
