import Elysia, { t } from "elysia";
import { searchService } from "../services/searchService";

const searchRoutes = new Elysia({ name: "search", prefix: "/search" })
  .post(
    "/semantic",
    async ({ body: { phrase, topK, offset } }) => {
      console.log(`Search phrase: ${phrase}`);

      try {
        return await searchService.semanticSearch(phrase, topK, offset);
      } catch (error) {
        console.error("Error during search:", error);
        if (error && typeof error === "object" && "data" in error) {
          const qdrantError = error as { data?: unknown };
          console.error(
            "Qdrant response data:",
            JSON.stringify(qdrantError.data, null, 2),
          );
        }
        throw new Error(
          "An error occurred while processing the search request.",
        );
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
        offset: t.Number({
          default: 0,
          description: "The number of ranked results to skip",
          error: "Offset must be a non-negative integer",
          examples: [0, 5, 10],
          maximum: 100,
          minimum: 0,
          title: "Result Offset",
        }),
      }),
    },
  )
  .post(
    "/hybrid",
    async ({ body: { phrase, topK, offset } }) => {
      console.log(`Hybrid search phrase: ${phrase}`);

      try {
        return await searchService.hybridSearch(phrase, topK, undefined, {
          offset,
        });
      } catch (error) {
        console.error("Error during hybrid search:", error);
        if (error && typeof error === "object" && "data" in error) {
          const qdrantError = error as { data?: unknown };
          console.error(
            "Qdrant response data:",
            JSON.stringify(qdrantError.data, null, 2),
          );
        }
        throw new Error(
          "An error occurred while processing the hybrid search request.",
        );
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
        offset: t.Number({
          default: 0,
          description: "The number of ranked results to skip",
          error: "Offset must be a non-negative integer",
          examples: [0, 5, 10],
          maximum: 100,
          minimum: 0,
          title: "Result Offset",
        }),
      }),
    },
  );

export default searchRoutes;
