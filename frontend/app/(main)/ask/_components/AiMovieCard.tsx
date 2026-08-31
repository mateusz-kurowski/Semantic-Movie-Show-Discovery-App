"use client";
import { Bookmark, BookmarkCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTmdbImageUrl } from "@/lib/utils/tmdbUtils";

/**
 * Mirrors the tool output shape in catalog-api's chatService. Duplicated per the
 * repo's no-cross-service-imports rule.
 */
export interface MoviePick {
	id: number;
	title: string;
	releaseDate: string | null;
	runtime: number | null;
	voteAverage: number | null;
	posterPath: string | null;
	genres: string[];
}

export const formatRuntime = (runtime: number | null) =>
	runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : null;

export const releaseYear = (releaseDate: string | null) =>
	releaseDate ? releaseDate.slice(0, 4) : null;

interface AiMovieCardProps {
	movie: MoviePick;
	isShortlisted: boolean;
	onToggleShortlist: (movie: MoviePick) => void;
}

const AiMovieCard = ({
	movie,
	isShortlisted,
	onToggleShortlist,
}: AiMovieCardProps) => {
	const meta = [releaseYear(movie.releaseDate), formatRuntime(movie.runtime)]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="flex w-44 flex-none flex-col overflow-hidden rounded-2xl border border-border bg-card sm:w-56">
			<Link href={`/movies/${movie.id}`} className="relative block">
				{movie.posterPath && (
					<Image
						src={getTmdbImageUrl(movie.posterPath)}
						alt={movie.title}
						className="aspect-[2/3] w-full object-cover"
						width={500}
						height={750}
					/>
				)}
			</Link>
			<div className="flex flex-1 flex-col gap-2.5 px-3.5 pt-3 pb-3.5">
				<div className="flex flex-col gap-1">
					<Link
						href={`/movies/${movie.id}`}
						className="truncate text-sm leading-5 font-semibold hover:text-primary"
					>
						{movie.title}
					</Link>
					<div className="flex items-center justify-between gap-2 text-xs text-outline">
						<span className="truncate">{meta}</span>
						{movie.voteAverage !== null && (
							<span className="flex flex-none items-center gap-1 text-tertiary">
								<Star className="size-3 fill-tertiary" />
								{movie.voteAverage.toFixed(1)}
							</span>
						)}
					</div>
				</div>
				{movie.genres.length > 0 && (
					<Badge variant="chip" className="w-fit">
						{movie.genres[0]}
					</Badge>
				)}
				<Button
					variant={isShortlisted ? "default" : "outline"}
					className="mt-auto h-8.5 w-full cursor-pointer rounded-[10px] text-[13px] font-semibold"
					onClick={() => onToggleShortlist(movie)}
				>
					{isShortlisted ? <BookmarkCheck /> : <Bookmark />}
					{isShortlisted ? "Shortlisted" : "Shortlist"}
				</Button>
			</div>
		</div>
	);
};

export default AiMovieCard;
