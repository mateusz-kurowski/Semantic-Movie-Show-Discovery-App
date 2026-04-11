import Elysia, { t } from "elysia";
import { searchService } from "../services/searchService";

const searchRoutes = new Elysia({ name: "search", prefix: "/search" }).post(
	"",
	async ({ body: { phrase, topK } }) => {
		console.log(`Search phrase: ${phrase}`);

		try {
			return await searchService.search(phrase, topK);
		} catch (error) {
			console.error("Error during search:", error);
			throw new Error("An error occurred while processing the search request.");
		}
	},
	{
		body: t.Object({
			phrase: t.String({
				description: "The search query",
				error: "Search query is required",
				examples: ["What are some good movies to watch?"],
				maxLength: 500,
				minLength: 1,
				title: "Search Query",
			}),
			topK: t.Number({
				default: 5,
				description: "The number of top results to return",
				error: "TopK must be a positive integer",
				examples: [5],
				minimum: 1,
				title: "Top K Results",
			}),
		}),
	},
);

export default searchRoutes;
