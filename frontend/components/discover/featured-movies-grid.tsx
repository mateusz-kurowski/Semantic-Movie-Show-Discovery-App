"use client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ComparableMovieField, movieService } from "@/lib/api/movies";
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

	const { data, isPending, isError, error } = useQuery({
		queryKey: order === "desc" ? [`${type}-movies`] : [`${type}-movies`, order],
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
		<section className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<h2 className="font-heading text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
					{heading}
				</h2>
				<div className="flex items-center gap-2">
					{isPopular && (
						<Button variant="link" className="cursor-pointer">
							<Link
								href="/discover/popular"
								className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface"
							>
								View all
							</Link>
						</Button>
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
				<div className="flex gap-4 overflow-hidden px-4 sm:gap-6 sm:px-6 lg:px-8">
					{Array.from({ length: 7 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton
							key={key}
							className="aspect-[2/3] w-38 flex-none rounded-2xl sm:w-53"
						/>
					))}
				</div>
			)}
			{isError && (
				<p className="px-4 py-8 text-center text-destructive sm:px-6 lg:px-8">
					Error: {error.message}
				</p>
			)}
			{data && (
				<div
					ref={railRef}
					className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:gap-6 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
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
