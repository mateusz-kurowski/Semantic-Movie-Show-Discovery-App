import Elysia, { t } from "elysia";
import movieService from "../services/movieService";

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

const movieRoutes = new Elysia({ name: "movies", prefix: "/movies" })
  .get(
    "",
    async ({ query: { limit, sortBy, order } }) => {
      const movies = movieService.getMovies({
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
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const movie = movieService.getMovieById(id);
      if (!movie) {
        return { status: 404, body: { message: "Movie not found" } };
      }
      return movie;
    },
    { params: t.Object({ id: t.Number() }) },
  );

export default movieRoutes;
