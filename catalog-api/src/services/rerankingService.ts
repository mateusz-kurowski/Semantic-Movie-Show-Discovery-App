import { env } from "../models/envModel";

// Same LiteLLM proxy the embedding service talks to, with the same key: the
// Voyage rerank model is provisioned in LiteLLM alongside embeddings, so this
// adds no new vendor, key, or egress. `rerank-2.5-lite` is the default model;
// override with RERANK_MODEL if the proxy exposes it under another id
// (e.g. a provider-prefixed one).
//
// NOTE: this deliberately does NOT use voyage-ai-provider's rerank() helper.
// That helper posts the right request but strictly validates the response
// against the Voyage-native shape ({object:"list",data:[...]}). The LiteLLM
// proxy answers HTTP 200 with its own normalized rerank shape, so the
// provider threw "Invalid JSON response" on every call. The raw fetch below
// sends the identical Voyage request body and accepts both response shapes.

// Movie-level payload fields the reranker scores. Every field is optional: a
// missing field degrades its document section to neutral, never drops the
// candidate.
export interface RerankCandidatePayload {
	genres?: string[];
	id?: number;
	overview?: string;
	release_date?: string;
	tagline?: string;
	title?: string;
	vote_average?: number;
	vote_count?: number;
}

export const buildRerankDocument = (
	payload: RerankCandidatePayload,
): string => {
	const parts: string[] = [];
	if (payload.title) parts.push(`Title: ${payload.title}`);
	if (payload.overview) parts.push(`Overview: ${payload.overview}`);
	if (payload.tagline) parts.push(`Tagline: ${payload.tagline}`);
	if (payload.genres && payload.genres.length > 0) {
		parts.push(`Genres: ${payload.genres.join(", ")}`);
	}
	const votes: string[] = [];
	if (typeof payload.vote_average === "number") {
		votes.push(`average ${payload.vote_average}`);
	}
	if (typeof payload.vote_count === "number") {
		votes.push(`${payload.vote_count} votes`);
	}
	if (votes.length > 0) {
		parts.push(`Audience rating: ${votes.join(", ")}`);
	}
	if (parts.length === 0) return "No catalogue data available.";
	return parts.join("\n");
};

interface RankedEntry {
	index: number;
	relevance_score: number;
}

const isRankedEntry = (value: unknown): value is RankedEntry => {
	if (typeof value !== "object" || value === null) return false;
	const entry = value as Record<string, unknown>;
	return (
		typeof entry.index === "number" && typeof entry.relevance_score === "number"
	);
};

const previewOf = (text: string, maxLength = 300): string => {
	if (!text) return "-";
	return text.replace(/\s+/g, " ").slice(0, maxLength);
};

// Reorders movie-level candidates by Voyage relevance to the query. Never
// throws and never drops a candidate: when disabled, given fewer than 2
// candidates, or on any rerank failure (timeout included), the input RRF
// order is returned and the fallback is warn-logged with strategy, HTTP
// status, model id, latency, reason, and a truncated raw-body preview.
export const rerank = async <T extends { payload?: unknown }>(
	query: string,
	candidates: T[],
): Promise<T[]> => {
	if (!env.rerankEnabled || candidates.length < 2) return candidates;
	const started = Date.now();
	const model = env.rerankModel;
	const documents = candidates.map((candidate) =>
		buildRerankDocument((candidate.payload ?? {}) as RerankCandidatePayload),
	);
	let status = "network";
	let bodyPreview = "-";
	try {
		const baseURL = env.openAIBaseUrl.replace(/\/+$/, "");
		const response = await fetch(`${baseURL}/rerank`, {
			body: JSON.stringify({
				documents,
				model,
				query,
				return_documents: false,
				top_k: candidates.length,
				truncation: true,
			}),
			headers: {
				Authorization: `Bearer ${env.openAIEmbeddingKey}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			signal: AbortSignal.timeout(env.rerankTimeoutMs),
		});
		status = String(response.status);
		const text = await response.text();
		bodyPreview = previewOf(text);
		if (!response.ok) {
			throw new Error(`http-${response.status} ${response.statusText}`);
		}
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			throw new Error("non-json-body");
		}
		// Voyage-native shape is {object:"list",data:[{index,relevance_score}]};
		// LiteLLM normalizes to {results:[{index,relevance_score,...}]}.
		const record = parsed as { data?: unknown; results?: unknown };
		const rawEntries = Array.isArray(record.data)
			? record.data
			: Array.isArray(record.results)
				? record.results
				: null;
		if (!rawEntries) {
			throw new Error("unexpected-shape (neither data nor results array)");
		}
		if (rawEntries.length !== candidates.length) {
			throw new Error(
				`expected ${candidates.length} ranked entries, got ${rawEntries.length}`,
			);
		}
		const seen = new Set<number>();
		const ordered: T[] = [];
		for (const raw of rawEntries) {
			if (!isRankedEntry(raw)) {
				throw new Error("unexpected-entry-shape");
			}
			if (
				!Number.isInteger(raw.index) ||
				raw.index < 0 ||
				raw.index >= candidates.length ||
				seen.has(raw.index)
			) {
				throw new Error(`invalid-index ${String(raw.index)}`);
			}
			seen.add(raw.index);
			ordered.push(candidates[raw.index]);
		}
		console.log(
			`[RerankingService] strategy=voyage-rerank model=${model} latencyMs=${Date.now() - started} candidates=${candidates.length}`,
		);
		return ordered;
	} catch (error) {
		if (error instanceof Error && status === "network") {
			status =
				error.name === "TimeoutError" || error.name === "AbortError"
					? "timeout"
					: "network";
		}
		const reason = error instanceof Error ? error.message : String(error);
		console.warn(
			`[RerankingService] strategy=rrf-fallback status=${status} model=${model} latencyMs=${Date.now() - started} reason=${reason} bodyPreview=${bodyPreview}`,
		);
		return candidates;
	}
};

const rerankingService = { buildRerankDocument, rerank };

export default rerankingService;
