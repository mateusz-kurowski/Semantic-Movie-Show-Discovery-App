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
  skipOriginCheck: ["/api/auth"],
  // Local Next.js dev origin; add more via BETTER_AUTH_TRUSTED_ORIGINS (comma-separated)
  // for production/staging deployments.
  trustedOrigins: ["http://localhost:3000"],
});
