"use client";
import { format } from "date-fns";
import { BookmarkCheck, ExternalLink, Play, Plus, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/api/movies";
import { useWatchlistEntry } from "@/lib/hooks/useWatchlistEntry";
import { getTmdbImageUrl } from "@/lib/utils/tmdbUtils";

interface MovieBannerProps {
	movie: Movie;
}

const currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

const formatMoney = (value: number) => (value ? currency.format(value) : "—");

const MovieBanner = ({ movie }: MovieBannerProps) => {
	const watchlist = useWatchlistEntry(movie.id);
	const facts: { label: string; value: string; mono?: boolean }[] = [
		{ label: "Status", value: movie.status },
		{ label: "Language", value: movie.original_language?.toUpperCase() },
		{ label: "Budget", value: formatMoney(movie.budget), mono: true },
		{ label: "Revenue", value: formatMoney(movie.revenue), mono: true },
		{ label: "Popularity", value: movie.popularity?.toFixed(2), mono: true },
	];

	return (
		<>
			<div className="top-container relative h-[38vh] w-full sm:h-[46vh] md:h-[52vh]">
				<Image
					className="object-cover"
					src={getTmdbImageUrl(movie.backdrop_path, "original")}
					alt={movie.title}
					fill
					priority
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background from-[4%] via-background/35 via-[55%] to-background/75" />
				<Button
					className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-14 cursor-pointer gap-2.5 rounded-full border border-foreground/22 bg-surface-container-lowest/50 px-6.5 text-base font-semibold text-on-surface backdrop-blur-xl hover:bg-surface-container-lowest/70"
					variant="ghost"
				>
					<Play /> Play trailer
				</Button>
			</div>

			<div className="relative -mt-24 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 md:-mt-35 md:flex-row md:gap-10">
				<div className="flex w-full shrink-0 flex-col gap-4 md:w-65">
					<Image
						className="w-40 self-center rounded-2xl border border-foreground/10 object-cover shadow-[0_24px_60px_rgba(0,0,0,0.6)] md:w-full md:self-auto"
						src={getTmdbImageUrl(movie.poster_path)}
						alt={`${movie.title} poster`}
						width={500}
						height={750}
					/>
					{watchlist.canSave && (
						<Button
							size="lg"
							variant={watchlist.isSaved ? "outline" : "default"}
							disabled={watchlist.isPending}
							onClick={watchlist.toggle}
							className="h-12 w-full cursor-pointer justify-center rounded-full text-[15px] font-semibold"
						>
							{watchlist.isSaved ? <BookmarkCheck /> : <Plus />}
							{watchlist.isSaved ? "In your watchlist" : "Add to watchlist"}
						</Button>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-8 md:flex-row md:gap-12 md:pt-37">
					<div className="flex min-w-0 flex-1 flex-col gap-5.5">
						<div className="flex flex-col gap-3.5">
							<div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
								<Badge
									variant="rating"
									className="h-7 gap-1.5 px-2.75 text-[13px]"
								>
									<Star className="fill-tertiary" />
									{movie.vote_average.toFixed(1)}
								</Badge>
								<span>{movie.vote_count.toLocaleString("en-US")} votes</span>
								<span className="size-1 rounded-full bg-outline" />
								<span>{format(new Date(movie.release_date), "yyyy")}</span>
								<span className="size-1 rounded-full bg-outline" />
								<span>{`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}</span>
							</div>
							<h1 className="text-3xl leading-9 font-bold tracking-[-0.04em] sm:text-4xl sm:leading-11 md:text-5xl md:leading-13">
								{movie.title}
							</h1>
							{movie.tagline && (
								<p className="text-lg leading-6.5 text-primary italic">
									{movie.tagline}
								</p>
							)}
							<div className="genres flex flex-wrap gap-2">
								{movie.genres.map((genre) => (
									<Badge
										key={genre}
										variant="chip"
										className="h-7 px-2.75 text-[13px]"
									>
										{genre}
									</Badge>
								))}
							</div>
						</div>
						<div className="overview flex flex-col gap-2.5">
							<p className="text-xs font-semibold tracking-[0.1em] text-outline">
								OVERVIEW
							</p>
							<p className="max-w-160 leading-6.5 text-on-surface-variant">
								{movie.overview}
							</p>
						</div>
					</div>

					<aside className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl border border-border bg-card p-5 md:w-70">
						<p className="text-xs font-semibold tracking-[0.1em] text-outline">
							FACTS
						</p>
						<dl className="flex flex-col gap-3">
							{facts.map(({ label, value, mono }) => (
								<div key={label} className="flex justify-between gap-3 text-sm">
									<dt className="text-outline">{label}</dt>
									<dd
										className={
											mono
												? "font-mono text-[13px] text-on-surface"
												: "text-on-surface"
										}
									>
										{value}
									</dd>
								</div>
							))}
						</dl>
						{movie.imdb_id && (
							<>
								<div className="h-px bg-border" />
								<a
									href={`https://www.imdb.com/title/${movie.imdb_id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
								>
									View on IMDb
									<ExternalLink className="size-3.5" />
								</a>
							</>
						)}
					</aside>
				</div>
			</div>
		</>
	);
};

export default MovieBanner;
