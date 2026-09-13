"use client";
import {
	type InfiniteData,
	type QueryKey,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { Bookmark, Frown, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import SearchForm from "@/components/discover/main-search";
import EmptyState from "@/components/shared/empty-state";
import MoviesGrid from "@/components/shared/movies-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type SearchResult, searchService } from "@/lib/api/search";

export const SEARCH_PAGE_SIZE = 10;
// Keeps in step with POPULAR_PAGE_SIZE = 10 on discover/popular: one page of
// posters per fetch. The search service clamps offset + topK to 100, so
// paging stops there.
const SEARCH_MAX_RESULTS = 100;

const SKELETON_GRID_CLASS =
	"grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

interface SearchResultsLayoutProps {
	phrase: string;
}

const SearchResultsLayout = ({ phrase }: SearchResultsLayoutProps) => {
	const search = useInfiniteQuery<
		SearchResult[],
		Error,
		InfiniteData<SearchResult[]>,
		QueryKey,
		number
	>({
		enabled: !!phrase,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < SEARCH_PAGE_SIZE) {
				return undefined;
			}
			const offset = allPages.flat().length;
			if (offset + SEARCH_PAGE_SIZE > SEARCH_MAX_RESULTS) {
				return undefined;
			}
			return offset;
		},
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			searchService.hybridSearch({
				phrase,
				topK: SEARCH_PAGE_SIZE,
				offset: pageParam,
			}),
		queryKey: ["search-results", phrase],
	});
	const results = useMemo(() => search.data?.pages.flat() ?? [], [search.data]);
	const movies = useMemo(
		() => results.map((result) => result.payload),
		[results],
	);
	const {
		fetchNextPage: fetchNextResultPage,
		hasNextPage: hasMoreResults,
		isFetchingNextPage: isFetchingMoreResults,
	} = search;

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
					hasMoreResults &&
					!isFetchingMoreResults
				) {
					void fetchNextResultPage();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [fetchNextResultPage, hasMoreResults, isFetchingMoreResults]);

	return (
		<main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			<div className="top-results-section flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="title-and-count-section flex flex-col items-start gap-2">
					<p className="text-xs font-semibold tracking-[0.1em] text-outline uppercase">
						Semantic match
					</p>
					<h1 className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-3xl sm:leading-9">
						<span className="text-primary">“{phrase}”</span>
					</h1>
					{search.data && (
						<p
							aria-live="polite"
							className="flex items-center gap-2.5 text-sm text-outline"
						>
							<span>
								<span className="font-medium text-on-surface">
									{results.length} films
								</span>{" "}
								ranked by meaning
							</span>
						</p>
					)}
					<Link
						href={`/ask?q=${encodeURIComponent(phrase)}`}
						className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
					>
						<Sparkles className="size-3.5" aria-hidden="true" />
						Ask AI about this search
					</Link>
				</div>
				<SearchForm
					togglesVisible={false}
					defaultValue={phrase || ""}
					btnVisible={false}
					icon={<Search />}
					compact
				/>
			</div>
			{search.isPending && (
				<div
					className={SKELETON_GRID_CLASS}
					aria-label="Loading search results"
					role="status"
				>
					{Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton key={key} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			)}
			{search.isError && (
				<div className="flex flex-col items-center gap-5">
					<EmptyState
						icon={Frown}
						title="Couldn't run that search"
						description={search.error.message}
					/>
					<Button
						variant="outline"
						className="h-9 cursor-pointer rounded-full px-4 text-sm"
						onClick={() => void search.refetch()}
					>
						Retry
					</Button>
				</div>
			)}
			{!search.isPending && !search.isError && results.length === 0 && (
				<EmptyState
					icon={Bookmark}
					title="No matches found"
					description="Try describing the feeling, plot, or film a little differently."
				/>
			)}
			{results.length > 0 && <MoviesGrid movies={movies} />}
			{hasMoreResults && (
				<div
					ref={loadMoreRef}
					aria-hidden="true"
					data-testid="search-results-sentinel"
					className={SKELETON_GRID_CLASS}
				>
					{isFetchingMoreResults &&
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
			{search.isFetchNextPageError && (
				<div className="flex items-center justify-center gap-2">
					<p className="text-sm text-destructive">
						Could not load more results.
					</p>
					<Button
						variant="outline"
						className="h-8 cursor-pointer rounded-full px-3 text-[13px]"
						onClick={() => void fetchNextResultPage()}
					>
						Retry
					</Button>
				</div>
			)}
		</main>
	);
};

export default SearchResultsLayout;
