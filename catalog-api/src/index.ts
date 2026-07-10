import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { validateEnvs } from "./models/envModel";
import embeddingRoutes from "./routes/embeddingRoutes";
import movieRoutes from "./routes/movieRoutes";
import searchRoutes from "./routes/searchRoutes";

export const envs = validateEnvs();

const app = new Elysia()
  .use(openapi())
  .use(embeddingRoutes)
  .use(searchRoutes)
  .use(movieRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
