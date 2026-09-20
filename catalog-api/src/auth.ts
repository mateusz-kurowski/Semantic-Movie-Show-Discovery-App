import crypto from "node:crypto";
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
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	// Mirrors index.ts's corsOrigins default — CORS and this are separate checks
	// (Elysia's cors() sets response headers; this rejects the request outright)
	// but both need the same origins trusted, or one blocks what the other allows.
	trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").filter(
		Boolean,
	) ?? ["http://localhost:3000", "https://movies.mkurowski.dev"],
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());
export const OpenAPI = {
	getPaths: (prefix = "/auth/api") =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null);
			for (const path of Object.keys(paths)) {
				const key = prefix + path;
				reference[key] = paths[path];
				for (const method of Object.keys(paths[path])) {
					// biome-ignore lint/suspicious/noExplicitAny: Elysia's OpenAPI plugin typing is not compatible with better-auth's OpenAPI schema typing
					const operation = (reference[key] as any)[method];
					operation.tags = ["Better Auth"];
				}
			}
			return reference;
			// biome-ignore lint/suspicious/noExplicitAny: Elysia's OpenAPI plugin typing is not compatible with better-auth's OpenAPI schema typing
		}) as Promise<any>,
	// biome-ignore lint/suspicious/noExplicitAny: better-auth's OpenAPI schema typing is not compatible with Elysia's OpenAPI plugin typing
	components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
