"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { watchlistService } from "@/lib/api/watchlist";
import { authClient } from "@/lib/auth/auth-client";

/**
 * Shared by the card bookmark and the details-page button. Both read the same
 * ["watchlist"] cache entry, so saving in one place updates the other.
 */
export const useWatchlistEntry = (movieId: string | number) => {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const id = Number(movieId);

	const { data } = useQuery({
		enabled: !!session?.user,
		queryFn: watchlistService.getWatchlist,
		queryKey: ["watchlist"],
	});

	const isSaved = data?.some((movie) => Number(movie.id) === id) ?? false;

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
