import { Elysia } from "elysia";
import { cacheClient } from "../index";
import { EmbeddingModel } from "../models/embeddingModels";
import cacheService from "../services/cacheService";
import embeddingService from "../services/embeddingService";

const embeddingRoutes = new Elysia({
	name: "embedding",
	prefix: "/embedding",
}).post(
	"",
	async ({ body: { inputs } }) => {
		try {
			if (inputs.length === 0) {
				return {};
			}

			console.log(
				`[EmbeddingRoute] Processing request for ${inputs.length} input(s)`,
			);
			const cached = await cacheService.getVectors(cacheClient, inputs);
			const missingInputs = inputs.filter((input) => cached[input] === null);

			console.log(
				`[EmbeddingRoute] Cache hit: ${inputs.length - missingInputs.length}, Cache miss: ${missingInputs.length}`,
			);

			let newEmbeddings: Record<string, number[]> = {};
			if (missingInputs.length > 0) {
				console.log(
					`[EmbeddingRoute] Fetching new embeddings for missing inputs...`,
				);
				newEmbeddings = await embeddingService.getEmbedding(missingInputs);

				console.log(
					`[EmbeddingRoute] Updating cache with ${Object.keys(newEmbeddings).length} new vector(s)`,
				);
				await Promise.all(
					Object.entries(newEmbeddings).map(([key, vector]) =>
						cacheService.setVector(cacheClient, key, vector),
					),
				);
			}

			const allEmbeddings = { ...cached, ...newEmbeddings } as Record<
				string,
				number[]
			>;

			console.log(`[EmbeddingRoute] Successfully resolved all embeddings`);
			// Return all embeddings directly mapping inputs to their vector
			return allEmbeddings;
		} catch (error) {
			console.error("[EmbeddingRoute] Error occurred:", error);
			throw error;
		}
	},
	EmbeddingModel,
);

export default embeddingRoutes;
