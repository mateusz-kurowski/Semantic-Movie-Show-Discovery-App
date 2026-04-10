import { t } from "elysia";

export const EmbeddingModel = {
	body: t.Object({
		inputs: t.Array(
			t.String({
				description: "The text to embed",
				error: "Text to embed is required",
				examples: ["What are some good movies to watch?"],
				title: "Text to Embed",
			}),
		),
	}),
	response: { 200: t.Record(t.String(), t.Array(t.Number())) },
} as const;
