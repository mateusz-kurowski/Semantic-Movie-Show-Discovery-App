import { type AnyColumn, asc, desc } from "drizzle-orm";
import { db } from "../clients";
import { movie } from "../db/catalog-schema";
import type { Movie } from "../types/movie";

export interface GetMoviesParams {
  limit: number;
  sortBy?: keyof Movie;
  order?: "asc" | "desc";
}

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
const dbService = {
  getMovies,
};

export default dbService;
