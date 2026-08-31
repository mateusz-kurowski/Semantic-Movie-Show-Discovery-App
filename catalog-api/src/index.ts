import { cors } from "@elysia/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { validateEnvs } from "./models/envModel";
import chatRoutes from "./routes/chatRoutes";
import embeddingRoutes from "./routes/embeddingRoutes";
import movieRoutes from "./routes/movieRoutes";
import searchRoutes from "./routes/searchRoutes";
import watchlistRoutes from "./routes/watchlistRoutes";

export const envs = validateEnvs();

const corsOrigins = process.env.CORS_ORIGINS?.split(",").filter(Boolean) ?? [
  "http://localhost:3000",
  "https://movies.mkurowski.dev",
];

const app = new Elysia({ name: "api", prefix: "/api" })
  .use(openapi())
  .use(embeddingRoutes)
  .use(searchRoutes)
  .use(movieRoutes)
  .use(cors({ credentials: true, origin: corsOrigins }))
  .mount(auth.handler)
  .use(chatRoutes)
  .use(watchlistRoutes)
  .listen(envs.apiPort);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
