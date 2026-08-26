"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ComparableMovieField, movieService } from "@/lib/api/movies";
import MoviesGrid from "../shared/movies-grid";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface FeaturedMoviesProps {
	type: ComparableMovieField;
}
const FeaturedMoviesGrid = ({ type }: FeaturedMoviesProps) => {
	const { data, isPending, isError, error } = useQuery({
		queryKey: [`${type}-movies`],
		queryFn: () => movieService.getFeaturedMovies(type),
	});

	const isPopular = type === ComparableMovieField.POPULARITY;

	return (
		<div>
			<div className="flex justify-between items-center w-full mb-4">
				<h2 className="font-heading font-bold text-xl sm:text-2xl">
					{isPopular && "Popular discoveries"}
				</h2>
				<Button variant="link">
					<Link
						href={isPopular ? "/discover/popular" : `/discover/${type}-movies`}
						className="text-primary flex items-center gap-1 hover:underline"
					>
						View all
						<ArrowRight />
					</Link>
				</Button>
			</div>
			{isPending && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
					<Skeleton className="aspect-[2/3] w-full rounded-xl" />
				</div>
			)}
			{isError && (
				<p className="text-destructive text-center py-8">
					Error: {error.message}
				</p>
			)}
			{data && <MoviesGrid movies={data} />}
		</div>
	);
};

export default FeaturedMoviesGrid;
