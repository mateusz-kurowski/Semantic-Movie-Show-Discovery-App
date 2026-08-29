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
		<main className="flex flex-col items-center p-5 gap-5">
			<h1 className="text-3xl font-bold">Popular movies</h1>
			{isPending && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full">
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
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
