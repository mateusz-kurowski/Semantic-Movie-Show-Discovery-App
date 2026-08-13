"use client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import SearchForm from "@/components/discover/main-search";
import MoviesGrid from "@/components/shared/movies-grid";
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
		<>
			{isPending && <div>Loading...</div>}
			{isError && <div>Error: {error.message}</div>}
			{data && (
				<main className="flex flex-col gap-4">
					<div className="top-results-section flex justify-between items-center">
						<div className="title-and-count-section">
							<h1 className="flex gap-2 text-2xl font-bold">
								<span>Personalized Results for</span>
								<span className="text-primary">"{phrase}"</span>
							</h1>
							<p className="text-on-surface-variant">
								{data.length} films found
							</p>
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
					<div>filters</div>
					<div p-6>
						<MoviesGrid movies={movies} />
					</div>
				</main>
			)}
		</>
	);
};

export default SearchResultsLayout;
