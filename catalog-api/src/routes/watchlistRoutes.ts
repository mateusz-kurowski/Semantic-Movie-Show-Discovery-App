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
		async ({ user, status }: any) => {
			try {
				return await watchlistService.getWatchlist(user.id);
			} catch (error) {
				console.error("[WatchlistRoutes] Error fetching watchlist:", error);
				return status(500, "Failed to fetch watchlist");
			}
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
