import openapi from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { env } from "bun";
import { Elysia } from "elysia";
import { validateEnvs } from "./models/envModel";
import embeddingRoutes from "./routes/embeddingRoutes";
import searchRoutes from "./routes/searchRoutes";

const traceExporter = new OTLPTraceExporter();

const batchSpanProcessor = new BatchSpanProcessor(traceExporter);

export const envs = validateEnvs();

const app = new Elysia()
  .use(openapi())
  .use(
    opentelemetry({
      serviceName: env.OTEL_SERVICE_NAME || "catalog-api",
      spanProcessors: [batchSpanProcessor],
    }),
  )
  .use(embeddingRoutes)
  .use(searchRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
