import { Elysia } from "elysia";
import { auth } from "./auth";

// A macro registered on a parent instance is invisible to a plugin built as
// its own `new Elysia()` (e.g. chatRoutes, watchlistRoutes) — Elysia resolves
// `.guard({ auth: true })` against the calling instance's own macro registry
// at guard-time, not the eventual parent's. Each guarded plugin must `.use()`
// this directly so the macro lands in its own registry before `.guard()` runs.
export const authMacro = new Elysia({ name: "auth-macro" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({ headers });
			if (!session) throw status(401);
			return {
				session: session.session,
				user: session.user,
			};
		},
	},
});
