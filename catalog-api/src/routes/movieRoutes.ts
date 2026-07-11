import Elysia, { t } from "elysia";
import dbService from "../services/dbService";

const movieRoutes = new Elysia({ name: "movies", prefix: "/movies" }).get(
  "",
  async ({ query: { limit, sortBy, order } }: any) => {
    const allowedKeys = [
      "id",
      "title",
      "voteAverage",
      "voteCount",
      "status",
      "releaseDate",
      "revenue",
      "runtime",
      "adult",
      "backdropPath",
      "budget",
      "homepage",
      "imdbId",
      "originalLanguage",
      "popularity",
      "isPresentInSearch",
    ];

    const key =
      typeof sortBy === "string" && allowedKeys.includes(sortBy)
        ? (sortBy as any)
        : "popularity";

    const movies = dbService.getMovies({
      limit,
      sortBy: { key, order },
    });
    return movies;
  },
  {
    query: t.Object({
      limit: t.Number({
        minimum: 1,
        maximum: 100,
        default: 10,
        description: "Number of movies to return",
        examples: [10, 20, 50],
      }),
      sortBy: t.String({
        default: "popularity",
        description: "Sort movies by this field",
        examples: ["popularity", "release_date", "rating"],
      }),
      order: t.String({
        default: "desc",
        description: "Sort order",
        examples: ["asc", "desc"],
      }),
    }),
  },
);

export default movieRoutes;
