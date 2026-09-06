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

// Per-query ranked-list cache so every page slices ONE ranking. Without it,
// each paged request reranks independently (500ms timeout + silent RRF
// fallback), so page 1 can rerank while page 2 falls back (or vice versa)
// and the two pages slice different orders with repeats scattered through.
// Key includes phrase + yearFilter + rerank flag + candidate sizing. The
// rerank flag keeps chat's getMovieDetails fallback ({rerank:false}) on
// entries that NEVER mix with reranked results. Offset/topK stay out of the
// key so all pages share the same cached order and slice their window.
export const buildHybridCacheKey = (
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

// Prefix-preserving merge for hit-short refetches: keep the cached head
// verbatim (it may already have served pages), append only movies missing
// from it. Same numeric-id dedup semantics as the per-movie collapse —
// points without a numeric id cannot be deduped and are always appended.
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
	// Single choke point for POST /search/hybrid and the chat tools: fetch
	// headroom for the per-movie collapse plus the page offset, rerank
	// movie-level docs, then cut the requested page out of the final ranking
	// so page 2 continues page 1's order. The full ranking (capped at
	// MAX_SEARCH_WINDOW) is cached per query in Redis: hits covering the page
	// slice it without touching Qdrant or rerank, misses run the pipeline
	// once and store it for the following pages, and hits shorter than the
	// page refetch with the deeper offset and overwrite the longer list.
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
	// A hit only serves when the cached ranking covers the requested page.
	// The cached list is only as long as the FIRST miss fetched (candidateK +
	// that miss's offset), so a deeper page can outgrow it — refetching with
	// the deeper offset and prefix-merging extends the same ranking. The old
	// head is kept verbatim because it may already have served pages: a fresh
	// rerank over a larger candidate set can interleave new docs ahead of old
	// ones (or flip to RRF fallback on timeout), shifting old items across
	// page boundaries and re-scattering repeats. Merging keeps served pages
	// immutable; only unseen tail movies are appended.
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
	// On a hit-short refetch, prefix-merge with the outgrown cached ranking
	// so already-served pages stay immutable; on a true miss there is no
	// cached head and the fresh ranking stands alone.
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
	buildHybridCacheKey,
	collapseToBestPerMovie,
	hybridSearch,
	semanticSearch,
};
export type { YearFilter };
