import { and, desc, eq } from "drizzle-orm";
import { db } from "../clients";
import { movie, watchlist } from "../db/catalog-schema";

const getWatchlist = async (userId: string) => {
	const rows = await db
		.select({ movie })
		.from(watchlist)
		.innerJoin(movie, eq(movie.id, watchlist.movie_id))
		.where(eq(watchlist.user_id, userId))
		.orderBy(desc(watchlist.id));

	return rows.map((row) => row.movie);
};

const isInWatchlist = async (userId: string, movieId: number) => {
	const [row] = await db
		.select({ id: watchlist.id })
		.from(watchlist)
		.where(and(eq(watchlist.user_id, userId), eq(watchlist.movie_id, movieId)))
		.limit(1);

	return row;
};

const addToWatchlist = async (userId: string, movieId: number) => {
	// There is no unique index on (user_id, movie_id), so adding the same film
	// twice would leave duplicate rows behind.
	const existing = await isInWatchlist(userId, movieId);
	if (existing) return existing;

	const [row] = await db
		.insert(watchlist)
		.values({ movie_id: movieId, user_id: userId })
		.returning({ id: watchlist.id });

	return row;
};

const removeFromWatchlist = async (userId: string, movieId: number) => {
	await db
		.delete(watchlist)
		.where(and(eq(watchlist.user_id, userId), eq(watchlist.movie_id, movieId)));
};

const watchlistService = {
	addToWatchlist,
	getWatchlist,
	isInWatchlist,
	removeFromWatchlist,
};

export default watchlistService;
