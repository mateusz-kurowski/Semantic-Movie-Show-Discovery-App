export interface Movie {
	id: string;
	title: string;
	vote_average: number;
	vote_count: number;
	status: string;
	release_date: string;
	revenue: number;
	runtime: number;
	adult: boolean;
	backdrop_path: string;
	budget: number;
	homepage: string;
	imdb_id: string;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	tagline: string;
	is_present_in_search: boolean;
}

const getMovies = async ({
	sortBy = "popularity",
	order = "desc",
	limit = 10,
}: {
	sortBy?: string;
	order?: "asc" | "desc";
	limit: number;
}): Promise<Movie[]> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_SEARCH_API_URL}/movies?sortBy=${sortBy}&order=${order}&limit=${limit}`,
	);
	const data = await response.json();
	return data;
};

export type ComparableMovieField =
	| "vote_average"
	| "vote_count"
	| "popularity"
	| "release_date"
	| "runtime"
	| "revenue";

const getFeaturedMovies = async (by: ComparableMovieField) =>
	getMovies({ sortBy: by, order: "desc", limit: 10 });

export const movieService = {
	getMovies,
	getFeaturedMovies,
};
