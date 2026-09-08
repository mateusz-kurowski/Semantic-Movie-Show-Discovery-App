import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Movie queries rarely change — keep data fresh for 5min to avoid refetch on refresh/remount.
				staleTime: 5 * 60 * 1000,
				// Keep unused query data in memory for 30min so back/forward navigation restores instantly.
				gcTime: 30 * 60 * 1000,
			},
		},
	});
}
