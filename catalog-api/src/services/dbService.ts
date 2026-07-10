import { type AnyColumn, asc, desc, type InferSelectModel } from "drizzle-orm";
import { movie } from "../../drizzle/schema";
import { db } from "../clients";

type Movie = InferSelectModel<typeof movie>;

interface GetMoviesParams {
  limit: number;
  sort?: SortMapping;
}

interface SortMapping {
  key: keyof Movie;
  order: "asc" | "desc";
}

const getMovies = async ({
  limit,
  sort,
}: GetMoviesParams): Promise<Movie[]> => {
  const columnRef =
    (movie[sort?.key as keyof typeof movie] as AnyColumn) ?? "popularity";
  const sortFn = sort?.order === "asc" ? asc : desc;
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
