"use client";
import {
	type InfiniteData,
	type QueryKey,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { Bookmark, Frown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import EmptyState from "@/components/shared/empty-state";
import MoviesGrid from "@/components/shared/movies-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@/lib/api/movies";
import { WATCHLIST_PAGE_SIZE, watchlistService } from "@/lib/api/watchlist";
import { authClient } from "@/lib/auth/auth-client";

const SKELETON_GRID_CLASS =
	"grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

const WatchlistLayout = () => {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	// Same ["watchlist"] key as useWatchlistEntry, so cards and this grid
	// read one shared paged cache and bookmark toggles refresh both.
	const watchlist = useInfiniteQuery<
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
	const movies = useMemo(
		() => watchlist.data?.pages.flat() ?? [],
		[watchlist.data],
	);
	const {
		fetchNextPage: fetchNextWatchlistPage,
		hasNextPage: hasMoreSaved,
		isFetchingNextPage: isFetchingMoreSaved,
	} = watchlist;

	// Infinite scroll: a sentinel div below the grid pulls the next page in
	// when it scrolls into view. Native IntersectionObserver on purpose — no
	// extra dependency for one trigger.
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (!session?.user) return;
		const target = loadMoreRef.current;
		if (!target) return;
		if (typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries.some((entry) => entry.isIntersecting) &&
					hasMoreSaved &&
					!isFetchingMoreSaved
				) {
					void fetchNextWatchlistPage();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [
		fetchNextWatchlistPage,
		hasMoreSaved,
		isFetchingMoreSaved,
		session?.user,
	]);

	if (isSessionPending) {
		return (
			<main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
				<Skeleton className="h-9 w-40 rounded-full" />
			</main>
		);
	}

	if (!session?.user) {
		return (
			<main className="flex flex-1 flex-col">
				<EmptyState
					icon={Bookmark}
					title="Sign in to see your watchlist"
					description="Your watchlist lives on your own server, tied to your account."
				/>
				<div className="flex justify-center pb-16">
					<Link
						href="/sign-in"
						className={buttonVariants({
							className: "h-11 rounded-full px-6 font-semibold",
						})}
					>
						Sign In
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-3xl">
				Watchlist
			</h1>

			{watchlist.isPending && (
				<div className={SKELETON_GRID_CLASS}>
					{Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton key={key} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			)}

			{watchlist.isError && (
				<EmptyState
					icon={Frown}
					title="Couldn't load your watchlist"
					description={watchlist.error.message}
				/>
			)}

			{!watchlist.isPending && !watchlist.isError && movies.length === 0 && (
				<EmptyState
					icon={Bookmark}
					title="Your watchlist is empty"
					description="Movies and shows you save will show up here."
				/>
			)}

			{movies.length > 0 && <MoviesGrid movies={movies} />}
			{hasMoreSaved && (
				<div
					ref={loadMoreRef}
					aria-hidden="true"
					data-testid="watchlist-sentinel"
					className={SKELETON_GRID_CLASS}
				>
					{isFetchingMoreSaved &&
						Array.from({ length: 5 }, (_, i) => `more-skeleton-${i}`).map(
							(key) => (
								<Skeleton
									key={key}
									className="aspect-[2/3] w-full rounded-2xl"
								/>
							),
						)}
				</div>
			)}
			{watchlist.isFetchNextPageError && (
				<div className="flex items-center justify-center gap-2">
					<p className="text-sm text-destructive">
						Could not load more saved films.
					</p>
					<Button
						variant="outline"
						className="h-8 cursor-pointer rounded-full px-3 text-[13px]"
						onClick={() => void fetchNextWatchlistPage()}
					>
						Retry
					</Button>
				</div>
			)}
		</main>
	);
};

export default WatchlistLayout;
