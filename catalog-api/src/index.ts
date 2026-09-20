import { cors } from "@elysia/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth, OpenAPI } from "./auth";
import { validateEnvs } from "./models/envModel";
import betterAuthRoutes from "./routes/betterAuth";
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

import "./instrumentation";

const app = new Elysia({ name: "api", prefix: "/api" })
	.use(cors({ credentials: true, origin: corsOrigins }))
	.use(
		openapi({
			documentation: {
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.use(betterAuthRoutes)
	.use(embeddingRoutes)
	.use(searchRoutes)
	.use(movieRoutes)
	.mount(auth.handler)
	.use(chatRoutes)
	.use(watchlistRoutes)
	.listen(envs.apiPort);

export type App = typeof app;

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
