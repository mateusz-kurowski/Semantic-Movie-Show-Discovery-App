"use client";
import {
	type InfiniteData,
	type QueryKey,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { Movie } from "@/lib/api/movies";
import { WATCHLIST_PAGE_SIZE, watchlistService } from "@/lib/api/watchlist";
import { authClient } from "@/lib/auth/auth-client";

/**
 * Shared by the card bookmark and the details-page button. Both read the same
 * ["watchlist"] cache entry as the watchlist page, so saving in one place
 * updates the other. The entry holds paged data, so bookmark state is read
 * across every page loaded so far.
 */
export const useWatchlistEntry = (movieId: string | number) => {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const id = Number(movieId);

	const { data } = useInfiniteQuery<
		Movie[],
		Error,
		InfiniteData<Movie[]>,
		QueryKey,
		number
	>({
		enabled: !!session?.user,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < WATCHLIST_PAGE_SIZE) {
				return undefined;
			}
			return allPages.flat().length;
		},
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			watchlistService.getWatchlist({
				limit: WATCHLIST_PAGE_SIZE,
				offset: pageParam,
			}),
		queryKey: ["watchlist"],
	});
	const movies = useMemo(() => data?.pages.flat() ?? [], [data]);

	const isSaved = movies.some((movie) => Number(movie.id) === id);

	const toggle = useMutation({
		mutationFn: () =>
			isSaved
				? watchlistService.removeFromWatchlist(id)
				: watchlistService.addToWatchlist(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
	});

	return {
		canSave: !!session?.user,
		isPending: toggle.isPending,
		isSaved,
		toggle: () => toggle.mutate(),
	};
};
