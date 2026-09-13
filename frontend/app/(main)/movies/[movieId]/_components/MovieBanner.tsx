"use client";
import {
	BookmarkCheck,
	ExternalLink,
	Plus,
	Sparkles,
	Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
const formatRating = (value: number) =>
	typeof value === "number" ? value.toFixed(1) : "—";
const formatVotes = (value: number) =>
	typeof value === "number" ? `${value.toLocaleString("en-US")} votes` : "—";
const formatYear = (value: string) => value?.slice(0, 4) || "—";
const formatRuntime = (value: number) =>
	value ? `${Math.floor(value / 60)}h ${value % 60}m` : "—";

const MovieBanner = ({ movie }: MovieBannerProps) => {
	const watchlist = useWatchlistEntry(movie.id);
	const facts: { label: string; value: string; mono?: boolean }[] = [
		{ label: "Status", value: movie.status || "—" },
		{ label: "Language", value: movie.original_language?.toUpperCase() || "—" },
		{ label: "Budget", value: formatMoney(movie.budget), mono: true },
		{ label: "Revenue", value: formatMoney(movie.revenue), mono: true },
		{
			label: "Popularity",
			value:
				typeof movie.popularity === "number"
					? movie.popularity.toFixed(2)
					: "—",
			mono: true,
		},
	];

	return (
		<>
			<div className="relative h-[38vh] w-full overflow-hidden bg-surface-container-lowest sm:h-[46vh] md:h-[52vh]">
				{movie.backdrop_path ? (
					<Image
						className="object-cover"
						src={getTmdbImageUrl(movie.backdrop_path, "original")}
						alt={movie.title}
						fill
						priority
						sizes="100vw"
					/>
				) : null}
				<div
					aria-hidden="true"
					className="absolute inset-0 bg-linear-to-t from-background from-[4%] via-background/40 via-[55%] to-background/70"
				/>
			</div>

			<div className="relative mx-auto -mt-24 flex w-full max-w-[1440px] flex-col gap-8 px-5 md:-mt-35 md:flex-row md:gap-10 md:px-16">
				<div className="flex w-full shrink-0 flex-col gap-3 md:w-65">
					{movie.poster_path ? (
						<Image
							className="aspect-[2/3] w-40 self-center rounded-2xl bg-muted object-cover shadow-[0_24px_60px_rgba(0,0,0,0.6)] md:w-full md:self-auto"
							src={getTmdbImageUrl(movie.poster_path)}
							alt={`${movie.title} poster`}
							width={500}
							height={750}
							loading="eager"
							sizes="(max-width: 768px) 160px, 260px"
						/>
					) : (
						<div
							aria-hidden="true"
							className="aspect-[2/3] w-40 self-center rounded-2xl bg-surface-container-high md:w-full md:self-auto"
						/>
					)}
					{watchlist.canSave && (
						<Button
							size="lg"
							variant={watchlist.isSaved ? "outline" : "default"}
							disabled={watchlist.isPending}
							onClick={watchlist.toggle}
							className="h-12 w-full cursor-pointer justify-center rounded-full text-[15px] font-semibold transition-all hover:shadow-[0_0_24px_rgba(208,188,255,0.3)]"
						>
							{watchlist.isSaved ? <BookmarkCheck /> : <Plus />}
							{watchlist.isSaved ? "In your watchlist" : "Add to watchlist"}
						</Button>
					)}
					<Link
						href={`/ask?q=${encodeURIComponent(movie.title)}`}
						aria-label={`Ask AI about ${movie.title}`}
						className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary/15 text-[15px] font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:bg-primary/20 hover:shadow-[0_0_24px_rgba(208,188,255,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<Sparkles className="size-4" aria-hidden="true" />
						Ask AI about this film
					</Link>
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-8 md:flex-row md:gap-12 md:pt-37">
					<div className="flex min-w-0 flex-1 flex-col gap-5.5">
						<div className="flex flex-col gap-3.5">
							<div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
								<Badge
									variant="rating"
									className="h-7 gap-1.5 px-2.75 text-[13px]"
								>
									<Star className="fill-tertiary" aria-hidden="true" />
									{formatRating(movie.vote_average)}
								</Badge>
								<span>{formatVotes(movie.vote_count)}</span>
								<span
									aria-hidden="true"
									className="size-1 rounded-full bg-outline"
								/>
								<span>{formatYear(movie.release_date)}</span>
								<span
									aria-hidden="true"
									className="size-1 rounded-full bg-outline"
								/>
								<span>{formatRuntime(movie.runtime)}</span>
								{movie.adult && (
									<Badge variant="outline" className="h-7 px-2.75 text-[13px]">
										Adult
									</Badge>
								)}
							</div>
							<h1 className="text-3xl leading-9 font-bold tracking-[-0.04em] text-on-surface sm:text-4xl sm:leading-11 md:text-5xl md:leading-13">
								{movie.title}
							</h1>
							{movie.original_title && movie.original_title !== movie.title && (
								<p className="text-sm text-outline">
									Original title: {movie.original_title}
								</p>
							)}
							{movie.tagline && (
								<p className="text-lg leading-6.5 text-primary italic">
									{movie.tagline}
								</p>
							)}
							{movie.genres.length > 0 && (
								<div className="flex flex-wrap gap-2">
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
							)}
						</div>
						{movie.overview && (
							<div className="flex flex-col gap-2.5">
								<p className="text-xs font-semibold uppercase tracking-[0.1em] text-outline">
									Overview
								</p>
								<p className="max-w-160 leading-6.5 text-on-surface-variant">
									{movie.overview}
								</p>
							</div>
						)}
					</div>

					<aside className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl bg-card p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] md:w-70">
						<p className="text-xs font-semibold uppercase tracking-[0.1em] text-outline">
							Facts
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
						{(movie.homepage || movie.imdb_id) && (
							<>
								<div aria-hidden="true" className="h-px bg-border" />
								<div className="flex flex-col gap-2">
									{movie.homepage && (
										<a
											href={movie.homepage}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
										>
											Official site
											<ExternalLink className="size-3.5" aria-hidden="true" />
										</a>
									)}
									{movie.imdb_id && (
										<a
											href={`https://www.imdb.com/title/${movie.imdb_id}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
										>
											View on IMDb
											<ExternalLink className="size-3.5" aria-hidden="true" />
										</a>
									)}
								</div>
							</>
						)}
					</aside>
				</div>
			</div>
		</>
	);
};

export default MovieBanner;
