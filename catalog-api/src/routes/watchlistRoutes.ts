import Elysia, { t } from "elysia";
import { authMacro } from "../authMacro";
import watchlistService from "../services/watchlistService";

const watchlistRoutes = new Elysia({ name: "watchlist", prefix: "/watchlist" })
	.use(authMacro)
	.guard({
		auth: true,
		// biome-ignore lint/suspicious/noExplicitAny: Elysia macro typing requires cast for auth guard
	} as any)
	.get(
		"/",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ user, query, status }: any) => {
			try {
				const limit = query.limit ?? 20;
				const offset = query.offset ?? 0;
				return await watchlistService.getWatchlist(user.id, limit, offset);
			} catch (error) {
				console.error("[WatchlistRoutes] Error fetching watchlist:", error);
				return status(500, "Failed to fetch watchlist");
			}
		},
		{
			query: t.Object({
				limit: t.Number({
					default: 20,
					description: "Number of watchlist entries to return",
					examples: [10, 20, 50],
					maximum: 100,
					minimum: 1,
				}),
				offset: t.Number({
					default: 0,
					description: "Number of watchlist entries to skip",
					examples: [0, 20, 40],
					minimum: 0,
				}),
			}),
		},
	)
	.post(
		"/",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ body, user, status }: any) => {
			try {
				await watchlistService.addToWatchlist(user.id, body.movieId);
				return { movieId: body.movieId, saved: true };
			} catch (error) {
				console.error("[WatchlistRoutes] Error adding to watchlist:", error);
				return status(500, "Failed to add to watchlist");
			}
		},
		{
			body: t.Object({
				movieId: t.Number({
					description: "ID of the movie to save",
					minimum: 1,
				}),
			}),
		},
	)
	.delete(
		"/:movieId",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ params, user, status }: any) => {
			try {
				await watchlistService.removeFromWatchlist(user.id, params.movieId);
				return { movieId: params.movieId, saved: false };
			} catch (error) {
				console.error(
					"[WatchlistRoutes] Error removing from watchlist:",
					error,
				);
				return status(500, "Failed to remove from watchlist");
			}
		},
		{
			params: t.Object({
				movieId: t.Number({
					description: "ID of the movie to remove",
					minimum: 1,
				}),
			}),
		},
	);

export default watchlistRoutes;
