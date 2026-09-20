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

// Chunk dedup: keep the best-ranked hit per film; non-numeric ids are kept.
const collapseToBestPerMovie = (points: ScoredPoint[]): ScoredPoint[] => {
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

// Window cap: offset+topK can never exceed 100.
const MAX_SEARCH_WINDOW = 100;

const clampWindow = (topK: number, offset: number) => {
	const safeOffset = Math.max(0, Math.min(offset, MAX_SEARCH_WINDOW));
	const safeTopK = Math.max(0, Math.min(topK, MAX_SEARCH_WINDOW - safeOffset));
	return { safeOffset, safeTopK };
};

// Rerank flag is in-key (rerank:false entries never mix); offset/topK stay out so pages share one ranking.
const buildHybridCacheKey = (
	phrase: string,
	yearFilter: YearFilter | undefined,
	rerankRequested: boolean,
	candidateK: number,
): string => {
	const yearPart =
		yearFilter?.yearFrom === undefined && yearFilter?.yearTo === undefined
			? "none"
			: `${yearFilter?.yearFrom ?? ""}-${yearFilter?.yearTo ?? ""}`;
	return `hybrid:v1:phrase=${phrase}:yf=${yearPart}:rr=${rerankRequested ? 1 : 0}:ck=${candidateK}:mult=${env.rerankCandidateMultiplier}:max=${env.rerankCandidateMax}`;
};

// Prefix-preserving merge: keep the cached head verbatim, append only missing movies.
const mergeRankings = (
	oldList: ScoredPoint[],
	fresh: ScoredPoint[],
): ScoredPoint[] => {
	const seen = new Set<number>();
	for (const point of oldList) {
		const id = (point.payload as RerankCandidatePayload | undefined)?.id;
		if (typeof id === "number") seen.add(id);
	}
	const merged = [...oldList];
	for (const point of fresh) {
		const id = (point.payload as RerankCandidatePayload | undefined)?.id;
		if (typeof id !== "number" || !seen.has(id)) {
			merged.push(point);
			if (typeof id === "number") seen.add(id);
		}
	}
	return merged;
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
	const { safeOffset, safeTopK } = clampWindow(topK, options?.offset ?? 0);
	if (safeTopK === 0) return [];
	const candidateK = Math.min(
		safeTopK * env.rerankCandidateMultiplier,
		env.rerankCandidateMax,
	);
	const rerankRequested = options?.rerank !== false;
	const cacheKey = buildHybridCacheKey(
		phrase,
		yearFilter,
		rerankRequested,
		candidateK,
	);
	let cached: ScoredPoint[] | null = null;
	try {
		if (cacheClient.isOpen) {
			const raw = await cacheClient.get(cacheKey);
			if (raw) {
				const parsed = JSON.parse(raw) as ScoredPoint[];
				if (Array.isArray(parsed)) cached = parsed;
			}
		}
	} catch (err) {
		console.warn(
			`[searchService] hybrid cache read failed key="${cacheKey}", falling back...`,
			err,
		);
	}
	if (cached && cached.length >= safeOffset + safeTopK) {
		console.log(
			`[searchService] hybrid cache hit-full key="${cacheKey}" offset=${safeOffset} topK=${safeTopK} cached=${cached.length}`,
		);
		return cached.slice(safeOffset, safeOffset + safeTopK);
	}
	if (cached) {
		console.log(
			`[searchService] hybrid cache hit-short-refetch key="${cacheKey}" offset=${safeOffset} topK=${safeTopK} cached=${cached.length}`,
		);
	} else {
		console.log(
			`[searchService] hybrid cache miss key="${cacheKey}" offset=${safeOffset} topK=${safeTopK}`,
		);
	}
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
	const ordered = rerankRequested
		? await rerankingService.rerank(phrase, movies)
		: movies;
	// Prefix-merge on hit-short refetch so served pages stay immutable.
	const full = (cached ? mergeRankings(cached, ordered) : ordered).slice(
		0,
		MAX_SEARCH_WINDOW,
	);
	try {
		if (cacheClient.isOpen) {
			await cacheClient.setEx(
				cacheKey,
				env.rerankPageCacheTtlSeconds,
				JSON.stringify(full),
			);
		}
	} catch (err) {
		console.warn(
			`[searchService] hybrid cache write failed key="${cacheKey}", skipping...`,
			err,
		);
	}
	return full.slice(safeOffset, safeOffset + safeTopK);
};
export const searchService = {
	hybridSearch,
	semanticSearch,
};
