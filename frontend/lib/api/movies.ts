export interface Movie {
  id: string;
  title: string;
  voteAverage: number;
  voteCount: number;
  status: string;
  releaseDate: string;
  revenue: number;
  runtime: number;
  adult: boolean;
  backdropPath: string;
  budget: number;
  homepage: string;
  imdbId: string;
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  popularity: number;
  posterPath: string;
  tagline: string;
  isPresentInSearch: boolean;
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

const getMainPagePopularMovies = async () =>
  getMovies({ sortBy: "popularity", order: "desc", limit: 10 });

export const movieService = {
  getMovies,
  getMainPagePopularMovies,
};
