import type { MoviePick } from "@/app/(main)/ask/_components/AiMovieCard";

export interface Chat {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
}

export interface StoredMessage {
	id: string;
	chatId: string;
	role: "user" | "assistant" | "system";
	content: string;
	movies: MoviePick[];
	createdAt: string;
}

export interface ChatWithMessages extends Chat {
	messages: StoredMessage[];
}

const chatUrl = (path = "") =>
	`${process.env.NEXT_PUBLIC_SEARCH_API_URL}/chat${path}`;

// Every chat route sits behind the auth guard, so the better-auth cookie has to
// ride along and a 401 has to surface rather than parse as JSON.
const authedFetch = async (url: string, init?: RequestInit) => {
	const response = await fetch(url, { credentials: "include", ...init });
	if (!response.ok) {
		throw new Error(
			response.status === 401
				? "Sign in to use Ask AI."
				: `Request failed with status ${response.status}`,
		);
	}
	return response;
};

const createChat = async (title?: string): Promise<Chat> => {
	const response = await authedFetch(chatUrl(), {
		body: JSON.stringify(title ? { title } : {}),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});
	return await response.json();
};

const listChats = async (): Promise<Chat[]> => {
	const response = await authedFetch(chatUrl());
	return await response.json();
};

const getChat = async (id: string): Promise<ChatWithMessages> => {
	const response = await authedFetch(chatUrl(`/${id}`));
	return await response.json();
};

const deleteChat = async (id: string): Promise<void> => {
	await authedFetch(chatUrl(`/${id}`), { method: "DELETE" });
};

const listModels = async (): Promise<string[]> => {
	const response = await authedFetch(chatUrl("/models"));
	return await response.json();
};

export const chatStreamUrl = (id: string) => chatUrl(`/${id}/stream`);

export const chatService = {
	createChat,
	deleteChat,
	getChat,
	listChats,
	listModels,
};
