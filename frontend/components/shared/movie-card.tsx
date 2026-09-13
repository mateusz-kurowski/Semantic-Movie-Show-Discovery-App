"use client";
import { Bookmark, BookmarkCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/lib/api/movies";
import { useWatchlistEntry } from "@/lib/hooks/useWatchlistEntry";
import { getTmdbImageUrl } from "@/lib/utils/tmdbUtils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const MovieCard = ({
	movie,
	priority = false,
}: {
	movie: Movie;
	priority?: boolean;
}) => {
	const releaseYear = movie.release_date?.slice(0, 4);
	const primaryGenre = movie.genres?.[0];
	const watchlist = useWatchlistEntry(movie.id);

	return (
		<Card className="group/card relative mx-auto w-full max-w-sm gap-0 rounded-2xl pt-0 pb-0 ring-1 ring-foreground/8 transition-all duration-200 hover:scale-[1.02] hover:ring-primary/35 hover:shadow-[0_0_0_1px_rgba(208,188,255,0.25),0_18px_50px_rgba(208,188,255,0.2)]">
			<Link href={`/movies/${movie.id}`}>
				<div className="absolute inset-0 z-30 " />
				<div className="relative">
					<Image
						src={getTmdbImageUrl(movie.poster_path)}
						alt={movie.title}
						className="relative z-20 aspect-[2/3] w-full rounded-t-2xl bg-muted object-cover"
						width={500}
						loading={priority ? undefined : "lazy"}
						height={750}
						sizes="(max-width: 768px) 50vw, 33vw"
						priority={priority}
					/>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-black/55 to-transparent"
					/>
				</div>
				{watchlist.canSave && (
					<Button
						className="absolute top-2 right-2 z-40 size-8 cursor-pointer rounded-full border-foreground/14 bg-surface-container-lowest/60 text-on-surface backdrop-blur-md hover:text-primary"
						variant="outline"
						size="icon"
						aria-label={
							watchlist.isSaved
								? `Remove ${movie.title} from watchlist`
								: `Save ${movie.title} to watchlist`
						}
						disabled={watchlist.isPending}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							watchlist.toggle();
						}}
					>
						{watchlist.isSaved ? (
							<BookmarkCheck
								data-icon="inline-center"
								className="text-primary"
							/>
						) : (
							<Bookmark data-icon="inline-center" />
						)}
					</Button>
				)}
				<CardHeader className="gap-1.5 px-3 pt-2.5 pb-3">
					<CardTitle className="truncate text-sm leading-4.5">
						{movie.title}
					</CardTitle>
					<CardDescription className="flex items-center justify-between text-xs text-outline">
						<span>{releaseYear}</span>
						{typeof movie.vote_average === "number" && (
							<span className="flex items-center gap-1 text-tertiary">
								<Star
									className="size-3.5 fill-tertiary text-tertiary"
									aria-hidden="true"
								/>
								{movie.vote_average.toFixed(1)}
							</span>
						)}
					</CardDescription>
					{primaryGenre && (
						<Badge variant="chip" className="w-fit">
							{primaryGenre}
						</Badge>
					)}
				</CardHeader>
			</Link>
		</Card>
	);
};

export default MovieCard;
