"use client";
import { useQuery } from "@tanstack/react-query";
import { Frown } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";
import MoviesGrid from "@/components/shared/movies-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { ComparableMovieField, movieService } from "@/lib/api/movies";

const PopularPage = () => {
	const {
		data: movies,
		isPending,
		isError,
	} = useQuery({
		queryKey: [`${ComparableMovieField.POPULARITY}-movies`],
		queryFn: () =>
			movieService.getFeaturedMovies(ComparableMovieField.POPULARITY),
	});

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
			{isPending && (
				<div className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
					{Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton key={key} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			)}
			{isError && (
				<EmptyState
					icon={Frown}
					title="Couldn't load popular movies"
					description="Something went wrong fetching popular movies. Please try again later."
				/>
			)}
			{movies && <MoviesGrid movies={movies} />}
		</main>
	);
};

export default PopularPage;
