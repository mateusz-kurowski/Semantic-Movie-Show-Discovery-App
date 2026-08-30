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
		<Card className="group/card relative mx-auto w-full max-w-sm gap-0 rounded-2xl pt-0 pb-0 ring-1 ring-foreground/8 transition-all duration-200 hover:scale-[1.02] hover:ring-primary/35 hover:shadow-[0_0_0_1px_rgba(208,188,255,0.25),0_18px_50px_rgba(208,188,255,0.2)]">
			<Link href={`/movies/${movie.id}`}>
				<div className="absolute inset-0 z-30 " />
				<Image
					src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
					alt={movie.title}
					className="relative z-20 aspect-[2/3] w-full object-cover"
					width={500}
					loading="eager"
					height={750}
				/>
				<Button
					className="absolute top-2 right-2 z-40 size-8 cursor-pointer rounded-full border-foreground/14 bg-surface-container-lowest/60 text-on-surface backdrop-blur-md hover:text-primary"
					variant="outline"
					size="icon"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<Bookmark data-icon="inline-center" />
				</Button>
				<CardHeader className="gap-1.5 px-3 pt-2.5 pb-3">
					<CardTitle className="truncate text-sm leading-4.5">
						{movie.title}
					</CardTitle>
					<CardDescription className="flex items-center justify-between text-xs text-outline">
						<span>{releaseYear}</span>
						<span className="flex items-center gap-1 text-tertiary">
							<Star className="size-3.5 fill-tertiary text-tertiary" />
							{movie.vote_average?.toFixed(1)}
						</span>
					</CardDescription>
				</CardHeader>
			</Link>
		</Card>
	);
};

export default MovieCard;
