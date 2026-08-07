import Elysia, { t } from "elysia";
import dbService, { type GetMoviesParams } from "../services/dbService";

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

const movieRoutes = new Elysia({ name: "movies", prefix: "/movies" }).get(
  "",
  async ({ query: { limit, sortBy, order } }) => {
    const movies = dbService.getMovies({
      limit,
      sortBy,
      order,
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
      sortBy: t.Union(
        allowedKeys.map((key) => t.Literal(key)),
        {
          default: "popularity",
          description: "Sort by field",
          examples: ["title", "releaseDate", "popularity"],
        },
      ),
      order: t.Union([t.Literal("asc"), t.Literal("desc")], {
        default: "desc",
        description: "Sort order",
        examples: ["asc", "desc"],
      }),
    }),
  },
);

export default movieRoutes;
