"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SearchForm from "@/components/discover/main-search";
import MovieCard from "@/components/shared/movie-card";
import { searchService } from "@/lib/api/search";

function SearchResults() {
	const searchParams = useSearchParams();
	const query = searchParams.get("q");
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["search-results", query],
		queryFn: async () =>
			searchService.hybridSearch({ phrase: query!, topK: 10 }),
		enabled: !!query,
	});
	console.log(data);

	return (
		<>
			<SearchForm defaultValue={query || ""} />
			{isPending && <div>Loading...</div>}
			{isError && <div>Error: {error.message}</div>}
			{data && (
				<div>
					<h1>Search Results for "{query}"</h1>
					<ul>
						{data.map((result) => (
							<MovieCard movie={result.payload} key={result.id} />
						))}
					</ul>
				</div>
			)}
		</>
	);
}

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SearchResults />
		</Suspense>
	);
};

export default Page;
