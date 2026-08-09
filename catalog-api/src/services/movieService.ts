import { type AnyColumn, asc, desc, eq } from "drizzle-orm";
import { db } from "../clients";
import { genre, movie, moviegenrelink } from "../db/catalog-schema";
import type { Movie } from "../types/movie";

export interface GetMoviesParams {
  limit: number;
  sortBy?: keyof Movie;
  order?: "asc" | "desc";
}

export type MovieWithGenres = Movie & { genres: string[] };

const getMovies = async ({
  limit,
  sortBy,
  order,
}: GetMoviesParams): Promise<Movie[]> => {
  const columnRef =
    (movie[sortBy as keyof typeof movie] as AnyColumn) ?? "popularity";
  const sortFn = order === "asc" ? asc : desc;
  const movies = await db
    .select()
    .from(movie)
    .orderBy(sortFn(columnRef))
    .limit(limit);
  return movies;
};

const getMovieById = async (
  movieId: number,
): Promise<MovieWithGenres | null> => {
  const rows = await db
    .select({ movie: movie, genreName: genre.name })
    .from(movie)
    .leftJoin(moviegenrelink, eq(moviegenrelink.movieId, movie.id))
    .leftJoin(genre, eq(moviegenrelink.genreId, genre.id))
    .where(eq(movie.id, movieId));

  if (rows.length === 0) {
    return null;
  }

  const genres = rows
    .map((row) => row.genreName)
    .filter((name): name is string => name !== null);

  return { ...rows[0].movie, genres };
};

const movieService = {
  getMovies,
  getMovieById,
};

export default movieService;
