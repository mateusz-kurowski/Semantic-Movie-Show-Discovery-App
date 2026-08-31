import { createOpenAI } from "@ai-sdk/openai";
import {
	convertToModelMessages,
	jsonSchema,
	stepCountIs,
	streamText,
	tool,
	type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { db } from "../clients";
import { chats, messages as messagesTable } from "../db/chat-schema";
import { env } from "../models/envModel";
import { searchService } from "./searchService";

// Same LiteLLM proxy the embedding service talks to, but its own key rather
// than the embedding key: this one is provisioned in LiteLLM with access to
// every chat model the user wants offered in the picker, not just one. `openai.chat`
// is deliberate: the callable form targets the Responses API, which the proxy
// does not serve — /chat/completions does.
const openai = createOpenAI({
	apiKey: env.openAIChatKey,
	baseURL: env.openAIBaseUrl,
});

const SYSTEM_PROMPT = `You are ReelFind's film concierge. The catalogue is a private vector index of films; you can only recommend what the searchMovies tool returns.

Rules:
- Always call searchMovies before naming any film. Never recommend a film from memory.
- Translate the mood, plot fragment or comparison the user gives you into a descriptive search phrase. Search again with a different phrase when they narrow the request.
- Keep replies to two or three sentences. Say why the picks fit the request, and name anything you deliberately left out.
- The tool result is already shown to the user as film cards, so do not repeat titles, years or ratings as a list.
- If the search comes back empty, say so and suggest how to loosen the request.`;

interface SearchPayload {
	id?: number;
	title?: string;
	release_date?: string;
	runtime?: number;
	vote_average?: number;
	poster_path?: string;
	overview?: string;
	genres?: string[];
}

export interface MoviePick {
	id: number;
	title: string;
	releaseDate: string | null;
	runtime: number | null;
	voteAverage: number | null;
	posterPath: string | null;
	genres: string[];
}

const toPick = (payload: SearchPayload): MoviePick | null => {
	if (!payload?.id || !payload.title) return null;
	return {
		genres: payload.genres ?? [],
		id: payload.id,
		posterPath: payload.poster_path ?? null,
		releaseDate: payload.release_date ?? null,
		runtime: payload.runtime ?? null,
		title: payload.title,
		voteAverage: payload.vote_average ?? null,
	};
};

const searchMovies = tool({
	description:
		"Search the ReelFind catalogue for films matching a natural-language description of mood, theme or plot. Returns the films to show the user.",
	execute: async ({ phrase, limit }) => {
		// The ingester splits long overviews into several points, so one film can
		// come back more than once — collapse to the best-ranked hit per film.
		const points = await searchService.hybridSearch(phrase, (limit ?? 4) * 3);
		const byId = new Map<number, MoviePick>();
		for (const point of points) {
			const pick = toPick(point.payload as SearchPayload);
			if (pick && !byId.has(pick.id)) byId.set(pick.id, pick);
		}
		return {
			movies: [...byId.values()].slice(0, limit ?? 4),
			phrase,
		};
	},
	inputSchema: jsonSchema<{ phrase: string; limit?: number }>({
		properties: {
			limit: {
				description: "How many films to return. Defaults to 4.",
				maximum: 8,
				minimum: 1,
				type: "number",
			},
			phrase: {
				description:
					"A descriptive phrase to match against film overviews, e.g. 'hopeful space exploration with a warm ending'.",
				type: "string",
			},
		},
		required: ["phrase"],
		type: "object",
	}),
});

export const chatTools = { searchMovies };

const textOf = (message: UIMessage) =>
	message.parts
		.filter((part) => part.type === "text")
		.map((part) => (part as { text: string }).text)
		.join("")
		.trim();

const persist = async (
	chatId: string,
	role: "user" | "assistant",
	content: string,
) => {
	if (!content) return;
	await db.insert(messagesTable).values({ chatId, content, role });
	await db
		.update(chats)
		.set({ updatedAt: new Date() })
		.where(eq(chats.id, chatId));
};

const streamChat = async (
	chatId: string,
	uiMessages: UIMessage[],
	model?: string,
) => {
	const lastMessage = uiMessages[uiMessages.length - 1];
	if (lastMessage?.role === "user") {
		await persist(chatId, "user", textOf(lastMessage));
	}

	const result = streamText({
		messages: await convertToModelMessages(uiMessages),
		model: openai.chat(model || env.openAIChatModel),
		stopWhen: stepCountIs(4),
		system: SYSTEM_PROMPT,
		tools: chatTools,
	});

	return result.toUIMessageStreamResponse({
		onFinish: async ({ responseMessage }) => {
			await persist(chatId, "assistant", textOf(responseMessage));
		},
	});
};

interface LiteLLMModel {
	id: string;
}

// The chat key is provisioned with access to a set of models the user manages
// entirely in LiteLLM; this is the OpenAI-compatible model-listing endpoint,
// scoped to whatever that key can see, so the picker never needs its own config.
const listModels = async (): Promise<string[]> => {
	const response = await fetch(`${env.openAIBaseUrl}/models`, {
		headers: { Authorization: `Bearer ${env.openAIChatKey}` },
	});
	if (!response.ok) {
		throw new Error(`Failed to list chat models (${response.status})`);
	}
	const { data } = (await response.json()) as { data: LiteLLMModel[] };
	return data.map((model) => model.id).sort();
};

const chatService = { listModels, streamChat };

export default chatService;
