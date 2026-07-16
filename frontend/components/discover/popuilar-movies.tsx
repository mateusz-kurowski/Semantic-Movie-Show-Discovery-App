"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { movieService } from "@/lib/api/movies";
import MoviesGrid from "../shared/movies-grid";
import { Button } from "../ui/button";

const PopularMovies = () => {
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["popular-movies"],
		queryFn: movieService.getMainPagePopularMovies,
	});

	return (
		<div>
			<div className="flex justify-between items-center w-full">
				<div className="font-bold text-xl">Popular discoveries</div>
				<Button variant="link">
					<Link
						href="/discover/popular-movies"
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

export default PopularMovies;
