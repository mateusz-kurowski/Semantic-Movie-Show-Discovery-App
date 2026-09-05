"use client";
import {
	type InfiniteData,
	type QueryKey,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { Frown } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import EmptyState from "@/components/shared/empty-state";
import MoviesGrid from "@/components/shared/movies-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ComparableMovieField,
	type Movie,
	movieService,
} from "@/lib/api/movies";

export const POPULAR_PAGE_SIZE = 10;

const SKELETON_GRID_CLASS =
	"grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

const PopularPage = () => {
	// Note: the key is deliberately NOT `${POPULARITY}-movies` — the home
	// rail (featured-movies-grid) caches a plain array under that key, while
	// this page caches paged InfiniteData. Sharing it would corrupt both.
	const popular = useInfiniteQuery<
		Movie[],
		Error,
		InfiniteData<Movie[]>,
		QueryKey,
		number
	>({
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < POPULAR_PAGE_SIZE) {
				return undefined;
			}
			return allPages.flat().length;
		},
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			movieService.getMovies({
				sortBy: ComparableMovieField.POPULARITY,
				order: "desc",
				limit: POPULAR_PAGE_SIZE,
				offset: pageParam,
			}),
		queryKey: [`${ComparableMovieField.POPULARITY}-movies`, "paged"],
	});
	const movies = useMemo(
		() => popular.data?.pages.flat() ?? [],
		[popular.data],
	);
	const {
		fetchNextPage: fetchNextPopularPage,
		hasNextPage: hasMorePopular,
		isFetchingNextPage: isFetchingMorePopular,
	} = popular;

	// Infinite scroll: a sentinel div below the grid pulls the next page in
	// when it scrolls into view. Native IntersectionObserver on purpose — no
	// extra dependency for one trigger.
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target) return;
		if (typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries.some((entry) => entry.isIntersecting) &&
					hasMorePopular &&
					!isFetchingMorePopular
				) {
					void fetchNextPopularPage();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [fetchNextPopularPage, hasMorePopular, isFetchingMorePopular]);

	return (
		<main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-2">
				<p className="text-xs font-semibold tracking-[0.1em] text-outline">
					DISCOVER
				</p>
				<h1 className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-3xl sm:leading-9">
					Popular movies
				</h1>
			</div>
			{popular.isPending && (
				<div className={SKELETON_GRID_CLASS}>
					{Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton key={key} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			)}
			{popular.isError && (
				<EmptyState
					icon={Frown}
					title="Couldn't load popular movies"
					description="Something went wrong fetching popular movies. Please try again later."
				/>
			)}
			{!popular.isPending && !popular.isError && movies.length === 0 && (
				<EmptyState
					icon={Frown}
					title="No popular movies yet"
					description="Check back once the catalogue has films to rank."
				/>
			)}
			{movies.length > 0 && <MoviesGrid movies={movies} />}
			{hasMorePopular && (
				<div
					ref={loadMoreRef}
					aria-hidden="true"
					data-testid="popular-movies-sentinel"
					className={SKELETON_GRID_CLASS}
				>
					{isFetchingMorePopular &&
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
			{popular.isFetchNextPageError && (
				<div className="flex items-center justify-center gap-2">
					<p className="text-sm text-destructive">
						Could not load more movies.
					</p>
					<Button
						variant="outline"
						className="h-8 cursor-pointer rounded-full px-3 text-[13px]"
						onClick={() => void fetchNextPopularPage()}
					>
						Retry
					</Button>
				</div>
			)}
		</main>
	);
};

export default PopularPage;
