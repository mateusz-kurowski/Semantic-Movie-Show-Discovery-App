"use client";
import { useQuery } from "@tanstack/react-query";
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
			<div className="flex justify-center py-16 text-on-surface-variant">
				Loading...
			</div>
		);
	}

	if (isError || !movie) {
		return (
			<div className="flex justify-center py-16 text-on-surface-variant">
				Error loading movie details.
			</div>
		);
	}

	return (
		<main>
			<MovieBanner movie={movie} />
		</main>
	);
};

export default MovieDetailsLayout;
