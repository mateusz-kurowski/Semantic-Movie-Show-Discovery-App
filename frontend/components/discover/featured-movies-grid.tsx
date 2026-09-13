"use client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clapperboard } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ComparableMovieField, movieService } from "@/lib/api/movies";
import EmptyState from "../shared/empty-state";
import MovieCard from "../shared/movie-card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface FeaturedMoviesProps {
	type: ComparableMovieField;
	order?: "asc" | "desc";
	title?: string;
}
const FeaturedMoviesGrid = ({
	type,
	order = "desc",
	title,
}: FeaturedMoviesProps) => {
	const railRef = useRef<HTMLDivElement>(null);

	// Note: kept distinct from the popular page key ["popular-movies", "paged"],
	// which caches paged InfiniteData. This rail caches a plain array.
	const { data, isPending, isError, error, refetch } = useQuery({
		queryKey: ["featured-movies", type, order],
		queryFn: () =>
			order === "desc"
				? movieService.getFeaturedMovies(type)
				: movieService.getMovies({ sortBy: type, order, limit: 10 }),
	});

	const isPopular = type === ComparableMovieField.POPULARITY;
	const heading = title ?? (isPopular ? "Popular discoveries" : "");

	const scrollRail = (direction: -1 | 1) => {
		railRef.current?.scrollBy({ left: direction * 480, behavior: "smooth" });
	};

	return (
		<section
			aria-label={heading || "Featured movies"}
			className="flex flex-col gap-4"
		>
			<div className="flex items-center justify-between gap-4 px-5 lg:px-16">
				<h2 className="font-heading text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
					{heading}
				</h2>
				<div className="flex items-center gap-2">
					{isPopular && (
						<Link
							href="/discover/popular"
							className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
						>
							View all
						</Link>
					)}
					<Button
						variant="outline"
						size="icon"
						aria-label="Scroll left"
						onClick={() => scrollRail(-1)}
						className="hidden size-8.5 cursor-pointer rounded-full sm:inline-flex"
					>
						<ChevronLeft />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Scroll right"
						onClick={() => scrollRail(1)}
						className="hidden size-8.5 cursor-pointer rounded-full sm:inline-flex"
					>
						<ChevronRight />
					</Button>
				</div>
			</div>
			{isPending && (
				<div className="flex gap-4 overflow-hidden px-5 sm:gap-6 lg:px-16">
					{Array.from({ length: 7 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton
							key={key}
							className="aspect-[2/3] w-38 flex-none rounded-2xl sm:w-53"
						/>
					))}
				</div>
			)}
			{isError && (
				<div className="flex flex-col items-center gap-3 px-5 py-8 text-center lg:px-16">
					<p className="text-sm text-destructive">Error: {error.message}</p>
					<Button
						variant="outline"
						className="cursor-pointer rounded-full"
						onClick={() => void refetch()}
					>
						Retry
					</Button>
				</div>
			)}
			{!isPending && !isError && data && data.length === 0 && (
				<EmptyState
					icon={Clapperboard}
					title="No movies found"
					description="Check back once the catalogue has films to rank."
				/>
			)}
			{data && data.length > 0 && (
				<div
					ref={railRef}
					role="region"
					aria-label={`${heading} movies`}
					className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:gap-6 lg:px-16 [&::-webkit-scrollbar]:hidden"
				>
					{data.map((movie) => (
						<div key={movie.id} className="w-38 flex-none snap-start sm:w-53">
							<MovieCard movie={movie} />
						</div>
					))}
				</div>
			)}
		</section>
	);
};

export default FeaturedMoviesGrid;
