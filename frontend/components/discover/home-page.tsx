"use client";
import { Sparkles } from "lucide-react";
import { ComparableMovieField } from "@/lib/api/movies";
import FeaturedMoviesGrid from "./featured-movies-grid";
import SearchForm from "./main-search";

const HomePage = () => {
	return (
		<main className="flex flex-col gap-14 py-12 sm:gap-20 sm:py-16">
			<section className="relative flex flex-col items-center gap-5 px-4 text-center sm:px-6 lg:px-8">
				<div
					aria-hidden
					className="pointer-events-none absolute -top-35 left-1/2 h-105 w-225 max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,--theme(--color-primary/22%),transparent)]"
				/>
				<span className="relative inline-flex h-7.5 items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3.5 text-xs font-semibold tracking-[0.06em] text-secondary">
					<span className="size-1.5 rounded-full bg-secondary shadow-[0_0_10px_var(--color-secondary)]" />
					HYBRID VECTOR SEARCH
				</span>
				<h1 className="relative max-w-4xl text-3xl leading-9 font-bold tracking-[-0.045em] sm:text-5xl sm:leading-13 md:text-6xl md:leading-16">
					Describe the film you can't name.
				</h1>
				<p className="relative max-w-xl text-base leading-7 text-on-surface-variant sm:text-lg">
					A vibe, a half-remembered plot, a feeling at 11pm on a Tuesday.
					ReelFind searches meaning, not keywords.
				</p>
				<div className="relative w-full">
					<SearchForm
						icon={<Sparkles />}
						showRecommendationBadges={true}
						showIconWhenNotEmpty={false}
					/>
				</div>
			</section>
			<div className="flex flex-col gap-9">
				<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />
				<FeaturedMoviesGrid
					type={ComparableMovieField.RUNTIME}
					order="asc"
					title="Under two hours"
				/>
			</div>
		</main>
	);
};

export default HomePage;
