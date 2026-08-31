import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import crypto from "node:crypto";
import { db } from "./clients";
import * as schema from "./db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.image) return { data: user };

          const emailHash = crypto
            .createHash("sha256")
            .update(user.email.trim().toLowerCase())
            .digest("hex");

          return {
            data: {
              ...user,
              image: `https://seccdn.libravatar.org/avatar/${emailHash}?d=retro`,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
  secret: process.env.BETTER_AUTH_SECRET,
  // Mirrors index.ts's corsOrigins default — CORS and this are separate checks
  // (Elysia's cors() sets response headers; this rejects the request outright)
  // but both need the same origins trusted, or one blocks what the other allows.
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").filter(
    Boolean,
  ) ?? ["http://localhost:3000", "https://movies.mkurowski.dev"],
});
