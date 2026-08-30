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
				<Skeleton className="h-[38vh] w-full rounded-none sm:h-[46vh] md:h-[52vh]" />
				<div className="relative -mt-24 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 md:-mt-35 md:flex-row md:gap-10">
					<Skeleton className="aspect-[2/3] w-40 shrink-0 self-center rounded-2xl md:w-65 md:self-auto" />
					<div className="flex min-w-0 flex-1 flex-col gap-4 md:pt-37">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-10 w-full max-w-xl" />
						<Skeleton className="h-4 w-full max-w-2xl" />
						<Skeleton className="h-4 w-full max-w-xl" />
						<Skeleton className="h-4 w-2/3 max-w-lg" />
					</div>
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
		<main className="flex-1 pb-16">
			<MovieBanner movie={movie} />
		</main>
	);
};

export default MovieDetailsLayout;
