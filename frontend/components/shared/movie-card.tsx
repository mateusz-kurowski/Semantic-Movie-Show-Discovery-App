import { Bookmark, Star } from "lucide-react";
import Image from "next/image";
import type { Movie } from "@/lib/api/movies";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const MovieCard = ({ movie }: { movie: Movie }) => {
	const releaseYear = new Date(movie.release_date).getFullYear();
	return (
		<Card className="relative mx-auto w-full max-w-sm pt-0">
			<div className="absolute inset-0 z-30 " />
			<Image
				src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
				alt="Event cover"
				className="relative z-20 w-full object-cover"
				width={500}
				height={450}
			/>
			<Button
				className="absolute top-2 right-2 z-40 cursor-pointer hover:text-primary rounded-full"
				variant="outline"
				size="icon"
			>
				<Bookmark data-icon="inline-center" />
			</Button>
			<CardHeader>
				<CardTitle>{movie.title}</CardTitle>
				<CardDescription className="flex items-center justify-between">
					<span>{releaseYear}</span>
					<span className="flex items-center gap-1">
						<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
						{movie.vote_average?.toFixed(1)}
					</span>
				</CardDescription>
			</CardHeader>
		</Card>
	);
};

export default MovieCard;
