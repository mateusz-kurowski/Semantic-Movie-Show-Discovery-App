import { type AnyColumn, asc, desc, type InferSelectModel } from "drizzle-orm";
import { movie } from "../db/catalog-schema";
import { db } from "../clients";

type Movie = InferSelectModel<typeof movie>;

interface GetMoviesParams {
  limit: number;
  sortBy?: SortMapping;
  order?: "asc" | "desc";
}

interface SortMapping {
  key: keyof Movie;
  order: "asc" | "desc";
}

const getMovies = async ({
  limit,
  sortBy,
  order,
}: GetMoviesParams): Promise<Movie[]> => {
  const columnRef =
    (movie[sortBy?.key as keyof typeof movie] as AnyColumn) ?? "popularity";
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
