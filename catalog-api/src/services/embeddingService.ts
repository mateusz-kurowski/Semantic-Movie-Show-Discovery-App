import type { RedisClient } from "bun";
import cacheService from "./cacheService";

const getEmbedding = async (
	inputs: string[],
): Promise<Record<string, number[]>> => {
	if (inputs.length === 0) return {};

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

	if (!response.ok) {
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(`Embedding API error: ${response.status} ${errorText}`);
	}

	const embeddingsArray = (await response.json()) as number[][];

	if (
		!Array.isArray(embeddingsArray) ||
		embeddingsArray.length !== inputs.length
	) {
		throw new Error(
			"Embedding API returned unexpected format or mismatched array length",
		);
	}

	return Object.fromEntries(
		inputs.map((input, index) => [input, embeddingsArray[index]]),
	);
};

const getEmbeddingWithCache = async (
	inputs: string[],
	cacheClient: RedisClient,
): Promise<Record<string, number[]>> => {
	if (inputs.length === 0) {
		return {};
	}

	const cached = await cacheService.getVectors(cacheClient, inputs);
	const missingInputs = inputs.filter((input) => !cached[input]);

	const newEmbeddings =
		missingInputs.length > 0 ? await getEmbedding(missingInputs) : {};

	if (missingInputs.length > 0) {
		await Promise.all(
			Object.entries(newEmbeddings).map(([key, vector]) =>
				cacheService.setVector(cacheClient, key, vector),
			),
		);
	}

	const resolvedEmbeddings: Record<string, number[]> = {};
	for (const input of inputs) {
		const embedding = cached[input] || newEmbeddings[input];
		if (!embedding) {
			throw new Error(`Missing embedding for input: ${input}`);
		}
		resolvedEmbeddings[input] = embedding;
	}

	return resolvedEmbeddings;
};

const embeddingService = {
	getEmbedding,
	getEmbeddingWithCache,
};

export default embeddingService;
