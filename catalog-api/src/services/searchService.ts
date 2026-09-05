import { cacheClient, qdrantClient } from "../clients";
import { env, getCollectionName } from "../models/envModel";
import embeddingService from "./openAIService";
import qdrantService, { type YearFilter } from "./qdrantService";
import rerankingService, {
	type RerankCandidatePayload,
} from "./rerankingService";

type ScoredPoint = Awaited<
	ReturnType<typeof qdrantService.hybridSearch>
>[number];

// The ingester splits long overviews into several points, so one film can
// come back more than once — collapse to the best-ranked (first) hit per
// film. Points without a numeric id cannot be deduped and are kept as-is, so
// collapsing never drops a candidate.
export const collapseToBestPerMovie = (
	points: ScoredPoint[],
): ScoredPoint[] => {
	const seen = new Set<number>();
	return points.filter((point) => {
		const id = (point.payload as RerankCandidatePayload | undefined)?.id;
		if (typeof id !== "number") return true;
		if (seen.has(id)) return false;
		seen.add(id);
		return true;
	});
};

export interface HybridSearchOptions {
	// Set false to keep raw RRF order (e.g. the getMovieDetails top-1
	// fallback, which bypasses rerank).
	rerank?: boolean;
}

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
	options?: HybridSearchOptions,
) => {
	// Single choke point for POST /search/hybrid and the chat tools: fetch
	// headroom for the per-movie collapse, rerank movie-level docs, then cut
	// to the requested count.
	const candidateK = Math.min(
		topK * env.rerankCandidateMultiplier,
		env.rerankCandidateMax,
	);
	const embedding = await embeddingService.getEmbeddingWithCache(
		phrase,
		cacheClient,
	);
	const points = await qdrantService.hybridSearch(
		qdrantClient,
		getCollectionName(),
		embedding,
		phrase,
		candidateK,
		yearFilter,
	);
	const movies = collapseToBestPerMovie(points);
	const ordered =
		options?.rerank === false
			? movies
			: await rerankingService.rerank(phrase, movies);
	return ordered.slice(0, topK);
};
export const searchService = {
	collapseToBestPerMovie,
	hybridSearch,
	semanticSearch,
};
export type { YearFilter };
