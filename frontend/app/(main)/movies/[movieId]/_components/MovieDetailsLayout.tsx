"use client";
import { useQuery } from "@tanstack/react-query";
import { Frown } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { movieService } from "@/lib/api/movies";
import MovieBanner from "./MovieBanner";

interface MovieDetailsLayoutProps {
	movieId: string;
}
const MovieDetailsLayout = ({ movieId }: MovieDetailsLayoutProps) => {
	const {
		data: movie,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["movie", movieId],
		queryFn: async () => movieService.getMovieById(movieId),
	});

	if (isLoading) {
		return (
			<div>
				<Skeleton className="w-full h-[45vh] sm:h-[55vh] md:h-[60vh] rounded-none" />
				<div className="max-w-6xl w-full mx-auto flex flex-col gap-3 p-4 sm:p-6">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-full max-w-2xl" />
					<Skeleton className="h-4 w-full max-w-xl" />
					<Skeleton className="h-4 w-2/3 max-w-lg" />
				</div>
			</div>
		);
	}

	if (isError || !movie) {
		return (
			<EmptyState
				icon={Frown}
				title="Couldn't load this movie"
				description="Something went wrong fetching the movie details. Please try again later."
			/>
		);
	}

	return (
		<main>
			<MovieBanner movie={movie} />
		</main>
	);
};

export default MovieDetailsLayout;
