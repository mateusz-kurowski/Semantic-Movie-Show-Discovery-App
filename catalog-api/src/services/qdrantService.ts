import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../models/envModel";

const getClient = async () =>
	new QdrantClient({
		apiKey: env.qdrantApiKey,
		checkCompatibility: false,
		host: env.qdrantHost,
		https: env.qdrantSSL,
		port: env.qdrantPort,
	});

export interface YearFilter {
	yearFrom?: number;
	yearTo?: number;
}

// release_date payloads are RFC3339 strings, so a DatetimeRange over the
// string form covers whole calendar years (yearFrom 1990 → gte "1990-01-01",
// yearTo 1999 → lte "1999-12-31"). `should` with `is_empty` keeps points with
// a missing/null release_date instead of dropping them on malformed data;
// partial ISO prefixes (e.g. "1999", "1999-05") still compare correctly.
const buildYearFilter = (yearFilter?: YearFilter) => {
	if (yearFilter?.yearFrom === undefined && yearFilter?.yearTo === undefined) {
		return undefined;
	}
	const range: { gte?: string; lte?: string } = {};
	if (yearFilter?.yearFrom !== undefined) {
		range.gte = `${yearFilter.yearFrom}-01-01`;
	}
	if (yearFilter?.yearTo !== undefined) {
		range.lte = `${yearFilter.yearTo}-12-31`;
	}
	return {
		should: [
			{ key: "release_date", range },
			{ key: "release_date", is_empty: true },
		],
	};
};

const semanticSearch = async (
	client: QdrantClient,
	collectionName: string,
	vector: number[],
	topK: number,
) => {
	const results = await client.query(collectionName, {
		limit: topK,
		query: vector,
		using: env.qdrantDenseVectorName,
		with_payload: true,
	});
	return results.points;
};

const hybridSearch = async (
	client: QdrantClient,
	collectionName: string,
	vector: number[],
	text: string,
	topK: number,
	yearFilter?: YearFilter,
) => {
	// Spread only when set so unfiltered callers send byte-identical requests.
	const filter = buildYearFilter(yearFilter);
	const maybeFilter = filter ? { filter } : {};
	const results = await client.query(collectionName, {
		...maybeFilter,
		limit: topK,
		prefetch: [
			{
				...maybeFilter,
				limit: topK * 2,
				query: vector,
				using: env.qdrantDenseVectorName,
			},
			{
				...maybeFilter,
				limit: topK * 2,
				query: { model: "bm25", text },
				using: env.qdrantSparseVectorName,
			},
		],
		query: { fusion: "rrf" },
		with_payload: true,
	});
	return results.points;
};

const qdrantService = {
	getClient,
	hybridSearch,
	semanticSearch,
};

export default qdrantService;
