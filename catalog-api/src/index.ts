import { cors } from "@elysia/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { validateEnvs } from "./models/envModel";
import embeddingRoutes from "./routes/embeddingRoutes";
import movieRoutes from "./routes/movieRoutes";
import searchRoutes from "./routes/searchRoutes";

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
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          session: session.session,
          user: session.user,
        };
      },
    },
  })
  .listen(envs.apiPort);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
