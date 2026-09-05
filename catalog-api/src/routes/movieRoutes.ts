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
    async ({ query: { limit, offset, sortBy, order } }) => {
      const movies = movieService.getMovies({
        limit,
        offset,
        order,
        sortBy,
      });
      return movies;
    },
    {
      query: t.Object({
        limit: t.Number({
          default: 10,
          description: "Number of movies to return",
          examples: [10, 20, 50],
          maximum: 100,
          minimum: 1,
        }),
        offset: t.Number({
          default: 0,
          description: "Number of movies to skip",
          examples: [0, 20, 40],
          minimum: 0,
        }),
        order: t.Union([t.Literal("asc"), t.Literal("desc")], {
          default: "desc",
          description: "Sort order",
          examples: ["asc", "desc"],
        }),
        sortBy: t.Union(
          allowedKeys.map((key) => t.Literal(key)),
          {
            default: "popularity",
            description: "Sort by field",
            examples: ["title", "releaseDate", "popularity"],
          },
        ),
      }),
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const movie = movieService.getMovieById(id);
      if (!movie) {
        return { body: { message: "Movie not found" }, status: 404 };
      }
      return movie;
    },
    { params: t.Object({ id: t.Number() }) },
  );

export default movieRoutes;
