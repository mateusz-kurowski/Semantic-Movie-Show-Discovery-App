const getMovies = async ({
  sortBy = "popularity",
  order = "desc",
  limit = 10,
}: {
  sortBy?: string;
  order?: "asc" | "desc";
  limit: number;
}) => {
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
