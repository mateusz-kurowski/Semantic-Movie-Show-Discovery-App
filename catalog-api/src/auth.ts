import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import { db } from "./clients";
import * as schema from "./db/schema";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Local Next.js dev origin; add more via BETTER_AUTH_TRUSTED_ORIGINS (comma-separated)
  // for production/staging deployments.
  trustedOrigins: ["http://localhost:3000"],
  plugins: [openAPI()],
});
