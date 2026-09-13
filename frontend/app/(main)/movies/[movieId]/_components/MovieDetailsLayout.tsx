"use client";
import { useQuery } from "@tanstack/react-query";
import { Frown, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type Movie, movieService } from "@/lib/api/movies";
import MovieBanner from "./MovieBanner";

interface MovieDetailsLayoutProps {
	movieId: string;
}

type MovieNotFound = { message: string };

const isMovie = (value: Movie | MovieNotFound | undefined): value is Movie =>
	typeof value === "object" &&
	value !== null &&
	"title" in value &&
	typeof (value as Movie).title === "string";

const CrossLinks = ({ title }: { title?: string }) => (
	<div className="mx-auto mt-12 w-full max-w-[1440px] px-5 md:px-16">
		<div className="flex flex-col gap-5 rounded-2xl bg-surface-container-low p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
			<div className="flex flex-col gap-2">
				<p className="text-xs font-semibold uppercase tracking-[0.1em] text-outline">
					Keep exploring
				</p>
				<p className="max-w-md text-lg leading-7 text-on-surface">
					find films by vibe, mood, or natural language
				</p>
			</div>
			<div className="flex flex-none flex-wrap items-center gap-3">
				<Link
					href="/"
					className={buttonVariants({
						className:
							"h-11 rounded-full px-6 font-semibold transition-all hover:shadow-[0_0_24px_rgba(208,188,255,0.3)]",
					})}
				>
					<Search aria-hidden="true" />
					Search films
				</Link>
				<Link
					href={title ? `/ask?q=${encodeURIComponent(title)}` : "/ask"}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary/15 px-6 text-[15px] font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:bg-primary/20 hover:shadow-[0_0_24px_rgba(208,188,255,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				>
					<Sparkles className="size-4" aria-hidden="true" />
					Ask AI
				</Link>
			</div>
		</div>
	</div>
);

const MovieDetailsLayout = ({ movieId }: MovieDetailsLayoutProps) => {
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["movie", movieId],
		queryFn: () => movieService.getMovieById(movieId),
	});

	if (isPending) {
		return (
			<main className="flex-1 pb-16">
				<Skeleton className="h-[38vh] w-full rounded-none sm:h-[46vh] md:h-[52vh]" />
				<div className="relative mx-auto -mt-24 flex w-full max-w-[1440px] flex-col gap-8 px-5 md:-mt-35 md:flex-row md:gap-10 md:px-16">
					<div className="flex w-full shrink-0 flex-col gap-3 md:w-65">
						<Skeleton className="aspect-[2/3] w-40 self-center rounded-2xl md:w-full md:self-auto" />
						<Skeleton className="h-12 w-full rounded-full" />
						<Skeleton className="h-12 w-full rounded-full" />
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-8 md:flex-row md:gap-12 md:pt-37">
						<div className="flex min-w-0 flex-1 flex-col gap-4">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-10 w-full max-w-xl" />
							<Skeleton className="h-4 w-full max-w-2xl" />
							<Skeleton className="h-4 w-full max-w-xl" />
							<Skeleton className="h-4 w-2/3 max-w-lg" />
						</div>
						<Skeleton className="h-52 w-full shrink-0 rounded-2xl md:w-70" />
					</div>
				</div>
			</main>
		);
	}

	if (isError) {
		return (
			<main className="flex flex-1 flex-col">
				<EmptyState
					icon={Frown}
					title="Couldn't load this movie"
					description={
						error instanceof Error
							? `Error: ${error.message}`
							: "Something went wrong fetching the movie details. Please try again later."
					}
				/>
				<CrossLinks />
			</main>
		);
	}

	if (!isMovie(data)) {
		return (
			<main className="flex flex-1 flex-col pb-16">
				<EmptyState
					icon={Frown}
					title="Movie not found"
					description="This film isn't in the catalogue. Try describing it instead and we'll search by meaning."
				/>
				<CrossLinks />
			</main>
		);
	}

	return (
		<main className="flex-1 pb-16">
			<MovieBanner movie={data} />
			<CrossLinks title={data.title} />
		</main>
	);
};

export default MovieDetailsLayout;
