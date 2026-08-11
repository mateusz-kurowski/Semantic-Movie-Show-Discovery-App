"use client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SearchForm from "@/components/discover/main-search";
import MoviesGrid from "@/components/shared/movies-grid";
import { searchService } from "@/lib/api/search";

const SearchResultsLayout = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("q");
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["search-results", query],
		queryFn: async () =>
			searchService.hybridSearch({ phrase: query!, topK: 10 }),
		enabled: !!query,
	});
	const movies = data?.map((result) => result.payload) || [];
	return (
		<>
			{isPending && <div>Loading...</div>}
			{isError && <div>Error: {error.message}</div>}
			{data && (
				<main className="flex flex-col gap-4">
					<div className="top-results-section flex justify-between items-center">
						<div className="title-and-count-section">
							<h1 className="flex gap-2 text-2xl font-bold">
								<span>Personalized Results for</span>
								<span className="text-primary">"{query}"</span>
							</h1>
							<p className="text-on-surface-variant">
								{data.length} films found
							</p>
						</div>
						<SearchForm
							togglesVisible={false}
							defaultValue={query || ""}
							btnVisible={false}
							icon={<Search />}
							compact
						/>
					</div>
					{/* todo: fix the count, this should not be the length of the data array */}
					<div>filters</div>

					<MoviesGrid movies={movies} />
				</main>
			)}
		</>
	);
};

export default SearchResultsLayout;
