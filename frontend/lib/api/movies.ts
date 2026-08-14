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
	genres: string[];
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
	return await response.json();
};

const getMovieById = async (movieId: string): Promise<Movie> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_SEARCH_API_URL}/movies/${movieId}`,
	);
	return await response.json();
};

export enum ComparableMovieField {
	VOTE_AVERAGE = "vote_average",
	VOTE_COUNT = "vote_count",
	POPULARITY = "popularity",
	RELEASE_DATE = "release_date",
	RUNTIME = "runtime",
	REVENUE = "revenue",
}

const getFeaturedMovies = async (by: ComparableMovieField) =>
	getMovies({ sortBy: by, order: "desc", limit: 10 });

export const movieService = {
	getMovies,
	getFeaturedMovies,
	getMovieById,
};
