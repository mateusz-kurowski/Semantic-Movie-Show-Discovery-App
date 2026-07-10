import Elysia, { t } from "elysia";
import dbService from "../services/dbService";

const movieRoutes = new Elysia({ name: "movies", prefix: "/movies" }).get(
  "",
  async ({ query: { limit } }) => {
    const movies = dbService.getMovies({ limit });
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
    }),
  },
);

export default movieRoutes;
