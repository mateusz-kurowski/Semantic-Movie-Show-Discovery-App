import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import { db } from "./clients";
import * as schema from "./db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
  secret: process.env.BETTER_AUTH_SECRET,
  // Local Next.js dev origin; add more via BETTER_AUTH_TRUSTED_ORIGINS (comma-separated)
  // for production/staging deployments.
  trustedOrigins: ["http://localhost:3000"],
  // Skip origin validation for auth routes only (array form — keeps the
  // cross-site navigation CSRF block intact). Needed for API clients that
  // send cookies but no Origin header (Postman, curl, mobile apps); browsers
  // always send Origin on POSTs, so this is a no-op for the web frontend.
  // Paths are relative to the app prefix ("/api" in src/index.ts).
  skipOriginCheck: ["/api/auth"],
});
