import { cors } from "@elysia/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth, betterAuthView } from "./auth";
import { validateEnvs } from "./models/envModel";
import authRoutes from "./routes/authRoutes";
import embeddingRoutes from "./routes/embeddingRoutes";
import movieRoutes from "./routes/movieRoutes";
import searchRoutes from "./routes/searchRoutes";

export const envs = validateEnvs();

const app = new Elysia()
  // .all("/auth/*", betterAuthView)
  .use(openapi())
  .use(embeddingRoutes)
  .use(searchRoutes)
  .use(movieRoutes)
  .use(authRoutes)
  .use(cors())
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .listen(envs.apiPort);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
