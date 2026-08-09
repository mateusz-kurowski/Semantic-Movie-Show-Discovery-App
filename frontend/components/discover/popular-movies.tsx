"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { type ComparableMovieField, movieService } from "@/lib/api/movies";
import MoviesGrid from "../shared/movies-grid";
import { Button } from "../ui/button";

interface FeaturedMoviesProps {
	type: ComparableMovieField;
}
const FeaturedMovies = ({ type }: FeaturedMoviesProps) => {
	const { data, isPending, isError, error } = useQuery({
		queryKey: [`${type}-movies`],
		queryFn: () => movieService.getFeaturedMovies(type),
	});

	const isPopular = type === "popularity";

	return (
		<div>
			<div className="flex justify-between items-center w-full">
				<div className="font-bold text-xl">
					{isPopular && "Popular discoveries"}
				</div>
				<Button variant="link">
					<Link
						href={`/discover/${type}-movies`}
						className="text-primary flex items-center gap-1 hover:underline"
					>
						View all
						<ArrowRight />
					</Link>
				</Button>
			</div>
			{isPending && <div>Loading...</div>}
			{isError && <div>Error: {error.message}</div>}
			{data && <MoviesGrid movies={data} />}
		</div>
	);
};

export default FeaturedMovies;
