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
	// Zero-based page offset into the final ranked movies. Defaults to 0.
	offset?: number;
}

// Offset pagination window cap: offset+topK can never exceed this, so deep
// pages cannot force unbounded Qdrant fetches or rerank payloads. Matches
// the max-100 convention on the list endpoints.
const MAX_SEARCH_WINDOW = 100;

const clampWindow = (topK: number, offset: number) => {
	const safeOffset = Math.max(0, Math.min(offset, MAX_SEARCH_WINDOW));
	const safeTopK = Math.max(0, Math.min(topK, MAX_SEARCH_WINDOW - safeOffset));
	return { safeOffset, safeTopK };
};

const semanticSearch = async (phrase: string, topK: number, offset = 0) => {
	const embedding = await embeddingService.getEmbeddingWithCache(
		phrase,
		cacheClient,
	);

	const { safeOffset, safeTopK } = clampWindow(topK, offset);
	if (safeTopK === 0) return [];

	const points = await qdrantService.semanticSearch(
		qdrantClient,
		getCollectionName(),
		embedding,
		safeOffset + safeTopK,
	);
	return points.slice(safeOffset, safeOffset + safeTopK);
};

const hybridSearch = async (
	phrase: string,
	topK: number,
	yearFilter?: YearFilter,
	options?: HybridSearchOptions,
) => {
	// Single choke point for POST /search/hybrid and the chat tools: fetch
	// headroom for the per-movie collapse plus the page offset, rerank
	// movie-level docs, then cut the requested page out of the final ranking
	// so page 2 continues page 1's order.
	const { safeOffset, safeTopK } = clampWindow(topK, options?.offset ?? 0);
	if (safeTopK === 0) return [];
	const candidateK = Math.min(
		safeTopK * env.rerankCandidateMultiplier,
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
		candidateK + safeOffset,
		yearFilter,
	);
	const movies = collapseToBestPerMovie(points);
	const ordered =
		options?.rerank === false
			? movies
			: await rerankingService.rerank(phrase, movies);
	return ordered.slice(safeOffset, safeOffset + safeTopK);
};
export const searchService = {
	collapseToBestPerMovie,
	hybridSearch,
	semanticSearch,
};
export type { YearFilter };
