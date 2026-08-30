"use client";
import { useQuery } from "@tanstack/react-query";
import { Frown, Search } from "lucide-react";
import SearchForm from "@/components/discover/main-search";
import EmptyState from "@/components/shared/empty-state";
import MoviesGrid from "@/components/shared/movies-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { searchService } from "@/lib/api/search";

interface SearchResultsLayoutProps {
	phrase: string;
}

const SearchResultsLayout = ({ phrase }: SearchResultsLayoutProps) => {
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["search-results", phrase],
		queryFn: async () => searchService.hybridSearch({ phrase, topK: 10 }),
		enabled: !!phrase,
	});
	const movies = data?.map((result) => result.payload) || [];
	return (
		<main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			<div className="top-results-section flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="title-and-count-section flex flex-col gap-2">
					<p className="text-xs font-semibold tracking-[0.1em] text-outline">
						SEMANTIC MATCH
					</p>
					<h1 className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-3xl sm:leading-9">
						<span className="text-primary">“{phrase}”</span>
					</h1>
					{data && (
						<p className="flex items-center gap-2.5 text-sm text-outline">
							<span>
								<span className="font-medium text-on-surface">
									{data.length} films
								</span>{" "}
								ranked by meaning
							</span>
						</p>
					)}
				</div>
				<SearchForm
					togglesVisible={false}
					defaultValue={phrase || ""}
					btnVisible={false}
					icon={<Search />}
					compact
				/>
			</div>
			{/* todo: fix the count, this should not be the length of the data array */}
			{isPending && (
				<div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
					{Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton key={key} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			)}
			{isError && (
				<EmptyState
					icon={Frown}
					title="Couldn't run that search"
					description={error.message}
				/>
			)}
			{data && <MoviesGrid movies={movies} />}
		</main>
	);
};

export default SearchResultsLayout;
