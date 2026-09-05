import { createOpenAI } from "@ai-sdk/openai";
import {
	convertToModelMessages,
	jsonSchema,
	stepCountIs,
	streamText,
	tool,
	type UIMessage,
} from "ai";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../clients";
import { genre, movie, moviegenrelink } from "../db/catalog-schema";
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
- Always call searchMovies before answering, including on follow-ups — never answer from conversation context alone.
- Translate the mood, plot fragment or comparison the user gives you into a descriptive search phrase. Search again with a different phrase when they narrow the request.
- When the user states a decade or years, pass yearFrom/yearTo to searchMovies and keep the phrase to vibe and plot only.
- Always present the closest matches the tool returns, with honest caveats when they fall outside the requested years (e.g. "closest in the catalogue, outside your decade") — never end with zero cards shown when the tool returned movies.
- Never claim to filter by family-suitability or age rating: the catalogue carries no certification data, only an adult flag. If asked, say suitability cannot be verified from catalogue data.
- Keep replies to two or three sentences before that line. Say why the picks fit the request, and name anything you deliberately left out.
- The tool result is already shown to the user as film cards, so do not repeat titles, years or ratings as a list.
- If the search comes back empty, say so and suggest how to loosen the request.
- When the user asks about a specific film (names a title, "tell me about X", "the spider-man movie from 2002"), call getMovieDetails with that title and the stated year when one is given, and prefer it over searchMovies for such asks.
- Keep searchMovies for mood/vibe/discovery requests ("something like...", "show me...", "find...").
- Details answers are prose built from the getMovieDetails result; film cards still come only from searchMovies output, so do not present the details result as a card list.
- If getMovieDetails returns found false, say so and suggest how to loosen the request (check spelling, drop the year) instead of inventing details.
- End EVERY reply with a standalone last line in exactly this format: Try: <one concrete follow-up search the user could send next> (e.g. a loosened phrase adding setting, decade, or actor).`;

interface SearchPayload {
	id?: number;
	title?: string;
	release_date?: string;
	runtime?: number;
	vote_average?: number;
	vote_count?: number;
	poster_path?: string;
	overview?: string;
	tagline?: string;
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
		"Search the ReelFind catalogue for films matching a natural-language description of mood, theme or plot. Returns the films to show the user. Optionally pre-filters by release year when the user states a decade or years.",
	execute: async ({ phrase, limit, yearFrom, yearTo }) => {
		// The ingester splits long overviews into several points, so one film can
		// come back more than once — collapse to the best-ranked hit per film.
		const yearFilter =
			yearFrom === undefined && yearTo === undefined
				? undefined
				: { yearFrom, yearTo };
		const points = await searchService.hybridSearch(
			phrase,
			(limit ?? 4) * 3,
			yearFilter,
		);
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
	inputSchema: jsonSchema<{
		phrase: string;
		limit?: number;
		yearFrom?: number;
		yearTo?: number;
	}>({
		properties: {
			limit: {
				description: "How many films to return. Defaults to 4.",
				maximum: 8,
				minimum: 1,
				type: "number",
			},
			phrase: {
				description:
					"A descriptive phrase to match against film overviews, e.g. 'hopeful space exploration with a warm ending'. Keep to vibe and plot only; never bake years into the phrase.",
				type: "string",
			},
			yearFrom: {
				description:
					"Earliest release year (inclusive), e.g. 1990 for '90s films. Only set when the user states a decade or years.",
				type: "number",
			},
			yearTo: {
				description:
					"Latest release year (inclusive), e.g. 1999. Only set when the user states a decade or years.",
				type: "number",
			},
		},
		required: ["phrase"],
		type: "object",
	}),
});

const yearOf = (releaseDate: string | null): number | null => {
	const year = releaseDate ? Number(releaseDate.slice(0, 4)) : NaN;
	return Number.isInteger(year) ? year : null;
};

const getMovieDetails = tool({
	description:
		"Look up details for a specific film by title, optionally disambiguated by release year. Use for asks naming a film ('tell me about X', 'the spider-man movie from 2002'). Falls back to a catalogue search when no title row matches.",
	execute: async ({ title, year }) => {
		const normalized = title.trim();
		const conditions = [
			sql`lower(${movie.title}) = ${normalized.toLowerCase()}`,
		];
		if (year !== undefined) {
			conditions.push(sql`EXTRACT(YEAR FROM ${movie.release_date}) = ${year}`);
		}
		const rows = await db
			.select({ genreName: genre.name, movie: movie })
			.from(movie)
			.leftJoin(moviegenrelink, eq(moviegenrelink.movieId, movie.id))
			.leftJoin(genre, eq(moviegenrelink.genreId, genre.id))
			.where(and(...conditions));

		if (rows.length > 0) {
			const first = rows[0].movie;
			const genres = rows
				.filter((row) => row.movie.id === first.id)
				.map((row) => row.genreName)
				.filter((name): name is string => name !== null);
			const releaseDate = first.release_date ?? null;
			return {
				found: true,
				genres,
				overview: first.overview,
				posterPath: first.poster_path,
				releaseDate,
				runtime: first.runtime,
				tagline: first.tagline || undefined,
				title: first.title,
				voteAverage: first.vote_average,
				voteCount: first.vote_count,
				year: yearOf(releaseDate),
			};
		}

		const phrase = year !== undefined ? `${normalized} ${year}` : normalized;
		const points = await searchService.hybridSearch(
			phrase,
			1,
			year !== undefined ? { yearFrom: year, yearTo: year } : undefined,
		);
		const payload = points[0]?.payload as SearchPayload | undefined;
		if (!payload?.title) {
			return { found: false, title: normalized, year: year ?? null };
		}
		const releaseDate = payload.release_date ?? null;
		return {
			found: true,
			genres: payload.genres ?? [],
			overview: payload.overview ?? null,
			posterPath: payload.poster_path ?? null,
			releaseDate,
			runtime: payload.runtime ?? null,
			...(payload.tagline ? { tagline: payload.tagline } : {}),
			title: payload.title,
			voteAverage: payload.vote_average ?? null,
			voteCount: payload.vote_count ?? null,
			year: yearOf(releaseDate) ?? year ?? null,
		};
	},
	inputSchema: jsonSchema<{ title: string; year?: number }>({
		properties: {
			title: {
				description: "Film title as named by the user, e.g. 'Spider-Man'.",
				type: "string",
			},
			year: {
				description:
					"Release year when the user states one, e.g. 2002. Only set when stated.",
				type: "number",
			},
		},
		required: ["title"],
		type: "object",
	}),
});

export const chatTools = { getMovieDetails, searchMovies };

const textOf = (message: UIMessage) =>
	message.parts
		.filter((part) => part.type === "text")
		.map((part) => (part as { text: string }).text)
		.join("")
		.trim();

// Tool outputs arrive as UI parts (static `tool-searchMovies` or
// `dynamic-tool` with toolName), each carrying the execute() result
// { movies, phrase } once the state is output-available.
const moviesOf = (message: UIMessage): MoviePick[] => {
	const byId = new Map<number, MoviePick>();
	for (const part of message.parts) {
		const toolPart = part as {
			type: string;
			toolName?: string;
			state?: string;
			output?: { movies?: MoviePick[] };
		};
		const isSearchMovies =
			toolPart.type === "tool-searchMovies" ||
			(toolPart.type === "dynamic-tool" &&
				toolPart.toolName === "searchMovies");
		if (
			!isSearchMovies ||
			toolPart.state !== "output-available" ||
			!Array.isArray(toolPart.output?.movies)
		) {
			continue;
		}
		for (const movie of toolPart.output.movies ?? []) {
			if (movie && !byId.has(movie.id)) byId.set(movie.id, movie);
		}
	}
	return [...byId.values()];
};

const persist = async (
	chatId: string,
	role: "user" | "assistant",
	content: string,
	movies?: MoviePick[],
) => {
	if (!content) return;
	await db
		.insert(messagesTable)
		.values({ chatId, content, movies: movies ?? null, role });
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
			await persist(
				chatId,
				"assistant",
				textOf(responseMessage),
				moviesOf(responseMessage),
			);
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
