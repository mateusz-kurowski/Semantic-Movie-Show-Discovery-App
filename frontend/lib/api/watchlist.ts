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

const getWatchlist = async (): Promise<Movie[]> => {
	const response = await authedFetch(watchlistUrl());
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
