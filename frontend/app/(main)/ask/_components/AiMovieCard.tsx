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

// Renders only catalogue fields from the tool output (title, year, runtime,
// rating, first genre). No confidence %, no citations, no source quotes —
// TODO P0.2 (confidence/chunkIds/citation line) is not built, so nothing here
// invents an AI-match ring or quote lines.
const AiMovieCard = ({
	movie,
	isShortlisted,
	onToggleShortlist,
}: AiMovieCardProps) => {
	const meta = [releaseYear(movie.releaseDate), formatRuntime(movie.runtime)]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="flex w-44 flex-none flex-col overflow-hidden rounded-2xl bg-card shadow-[0_8px_28px_rgb(0_0_0/0.45)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgb(0_0_0/0.5),0_0_24px_color-mix(in_oklch,var(--primary)_22%,transparent)] sm:w-56">
			<Link
				href={`/movies/${movie.id}`}
				className="relative block focus-visible:outline-2 focus-visible:outline-primary"
			>
				{movie.posterPath && (
					<Image
						src={getTmdbImageUrl(movie.posterPath)}
						alt={movie.title}
						className="aspect-[2/3] w-full bg-muted object-cover"
						width={500}
						height={750}
						loading="lazy"
						sizes="(max-width: 640px) 176px, 224px"
					/>
				)}
				<span
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
				/>
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
					aria-pressed={isShortlisted}
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
