"use client";
import { BookmarkPlus, Loader2, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTmdbImageUrl } from "@/lib/utils/tmdbUtils";
import { formatRuntime, type MoviePick, releaseYear } from "./AiMovieCard";

interface ShortlistRailProps {
	movies: MoviePick[];
	isSaving: boolean;
	saveError: string | null;
	onRemove: (movieId: number) => void;
	onClear: () => void;
	onSaveAll: () => void;
}

const ShortlistRail = ({
	movies,
	isSaving,
	saveError,
	onRemove,
	onClear,
	onSaveAll,
}: ShortlistRailProps) => (
	<aside className="flex w-full flex-col border-border border-t bg-surface-container-lowest/60 lg:w-85 lg:flex-none lg:border-t-0 lg:border-l">
		<div className="flex items-center justify-between border-border border-b px-5 py-4">
			<div className="flex items-baseline gap-2">
				<h2 className="text-[15px] font-semibold">Shortlist</h2>
				{movies.length > 0 && (
					<span className="inline-flex h-5 items-center rounded-full bg-primary/16 px-1.5 text-[11px] font-bold text-primary">
						{movies.length}
					</span>
				)}
			</div>
			{movies.length > 0 && (
				<Button
					variant="link"
					className="h-auto cursor-pointer p-0 text-sm text-outline hover:text-on-surface"
					onClick={onClear}
				>
					Clear
				</Button>
			)}
		</div>

		<div className="flex flex-1 flex-col gap-2.5 p-3.5">
			{movies.map((movie) => (
				<div
					key={movie.id}
					className="flex gap-3 rounded-[14px] border border-border bg-card p-2.5"
				>
					{movie.posterPath && (
						<Link href={`/movies/${movie.id}`} className="flex-none">
							<Image
								src={getTmdbImageUrl(movie.posterPath)}
								alt={movie.title}
								className="w-12 rounded-lg object-cover"
								width={100}
								height={150}
							/>
						</Link>
					)}
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<Link
							href={`/movies/${movie.id}`}
							className="truncate text-sm leading-4.5 font-semibold hover:text-primary"
						>
							{movie.title}
						</Link>
						<span className="text-xs text-outline">
							{[releaseYear(movie.releaseDate), formatRuntime(movie.runtime)]
								.filter(Boolean)
								.join(" · ")}
						</span>
						{movie.voteAverage !== null && (
							<span className="flex items-center gap-1 text-[11px] text-tertiary">
								<Star className="size-3 fill-tertiary" />
								{movie.voteAverage.toFixed(1)}
							</span>
						)}
					</div>
					<Button
						variant="ghost"
						size="icon"
						aria-label={`Remove ${movie.title} from shortlist`}
						className="size-6 flex-none cursor-pointer rounded-full text-outline hover:text-on-surface"
						onClick={() => onRemove(movie.id)}
					>
						<X />
					</Button>
				</div>
			))}

			{movies.length === 0 && (
				<p className="rounded-[14px] border border-dashed border-foreground/14 p-3.5 text-[13px] leading-5 text-outline">
					Films you shortlist stay here for the whole conversation — send them
					to your watchlist in one action.
				</p>
			)}
		</div>

		{movies.length > 0 && (
			<div className="flex flex-col gap-2.5 border-border border-t p-4">
				{saveError && (
					<p role="alert" className="text-sm text-destructive">
						{saveError}
					</p>
				)}
				<Button
					className="h-11 w-full cursor-pointer rounded-full text-[15px] font-semibold"
					disabled={isSaving}
					onClick={onSaveAll}
				>
					{isSaving ? <Loader2 className="animate-spin" /> : <BookmarkPlus />}
					{isSaving ? "Saving…" : "Save all to watchlist"}
				</Button>
			</div>
		)}
	</aside>
);

export default ShortlistRail;
