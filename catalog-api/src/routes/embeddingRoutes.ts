import { Elysia } from "elysia";
import { cacheClient } from "../clients";
import { EmbeddingModel } from "../models/embeddingModels";
import cacheService from "../services/cacheService";
import embeddingService from "../services/embeddingService";

const embeddingRoutes = new Elysia({
	name: "embedding",
	prefix: "/embedding",
}).post(
	"",
	async ({ body: { phrase } }) => {
		try {
			if (!phrase?.length) return [];
			console.log(`[EmbeddingRoute] Processing request for ${phrase}`);

			const cached = await cacheService.getVector(cacheClient, phrase);
			if (cached) return cached;

			return await embeddingService.getEmbedding(phrase);
		} catch (error) {
			console.error("[EmbeddingRoute] Error occurred:", error);
			throw error;
		}
	},
	EmbeddingModel,
);

export default embeddingRoutes;
