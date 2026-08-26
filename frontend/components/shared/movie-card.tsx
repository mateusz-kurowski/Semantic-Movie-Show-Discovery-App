"use client";
import { Bookmark, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/lib/api/movies";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const MovieCard = ({ movie }: { movie: Movie }) => {
	const releaseYear = new Date(movie.release_date).getFullYear();

	return (
		<Card className="relative mx-auto w-full max-w-sm pt-0 transition-shadow duration-200 hover:shadow-lg hover:ring-primary/40">
			<Link href={`/movies/${movie.id}`}>
				<div className="absolute inset-0 z-30 " />
				<Image
					src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
					alt={movie.title}
					className="relative z-20 aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
					width={500}
					loading="eager"
					height={750}
				/>
				<Button
					className="absolute top-2 right-2 z-40 cursor-pointer hover:text-primary rounded-full"
					variant="outline"
					size="icon"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<Bookmark data-icon="inline-center" />
				</Button>
				<CardHeader>
					<CardTitle className="truncate">{movie.title}</CardTitle>
					<CardDescription className="flex items-center justify-between">
						<span>{releaseYear}</span>
						<span className="flex items-center gap-1">
							<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
							{movie.vote_average?.toFixed(1)}
						</span>
					</CardDescription>
				</CardHeader>
			</Link>
		</Card>
	);
};

export default MovieCard;
