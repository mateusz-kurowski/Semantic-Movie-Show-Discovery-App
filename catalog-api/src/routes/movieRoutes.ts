import Elysia from "elysia";

const movieRoutes = new Elysia({ name: "movies", prefix: "/movies" }).get(
  "",
  async () => {
    return {
      movies: [
        {
          director: "Frank Darabont",
          id: 1,
          title: "The Shawshank Redemption",
          year: 1994,
        },
      ],
    };
  },
);

export default movieRoutes;
