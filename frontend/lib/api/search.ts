import type { Movie } from "./movies";

export interface SearchResult {
	payload: Movie;
	score: number;
	id: number;
	version: number;
}

export interface SearchRequest {
	topK?: number;
	phrase: string;
}

const hybridSearch = async (
	request: SearchRequest,
): Promise<SearchResult[]> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_SEARCH_API_URL}/search/hybrid`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		},
	);
	const data = await response.json();
	return data;
};

export const searchService = {
	hybridSearch,
};
