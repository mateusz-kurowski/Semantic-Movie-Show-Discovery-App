import type { Movie } from "./movies";

const watchlistUrl = (path = "") =>
	`${process.env.NEXT_PUBLIC_SEARCH_API_URL}/watchlist${path}`;

const authedFetch = async (url: string, init?: RequestInit) => {
	const response = await fetch(url, { credentials: "include", ...init });
	if (!response.ok) {
		throw new Error(
			response.status === 401
				? "Sign in to use your watchlist."
				: `Request failed with status ${response.status}`,
		);
	}
	return response;
};

// Matches the backend default (GET /watchlist: limit default 20, max 100).
export const WATCHLIST_PAGE_SIZE = 20;

export interface ListWatchlistParams {
	limit?: number;
	offset?: number;
}

const getWatchlist = async (params?: ListWatchlistParams): Promise<Movie[]> => {
	const search = new URLSearchParams();
	if (params?.limit !== undefined) {
		search.set("limit", String(params.limit));
	}
	if (params?.offset !== undefined) {
		search.set("offset", String(params.offset));
	}
	const query = search.toString();
	const response = await authedFetch(watchlistUrl(query ? `?${query}` : ""));
	return await response.json();
};

const addToWatchlist = async (movieId: number): Promise<void> => {
	await authedFetch(watchlistUrl(), {
		body: JSON.stringify({ movieId }),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});
};

const removeFromWatchlist = async (movieId: number): Promise<void> => {
	await authedFetch(watchlistUrl(`/${movieId}`), { method: "DELETE" });
};

export const watchlistService = {
	addToWatchlist,
	getWatchlist,
	removeFromWatchlist,
};
