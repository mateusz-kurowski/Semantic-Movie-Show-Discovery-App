"use client";
import { Sparkles } from "lucide-react";
import { ComparableMovieField } from "@/lib/api/movies";
import FeaturedMoviesGrid from "./featured-movies-grid";
import SearchForm from "./main-search";

const HomePage = () => {
	return (
		<main className="flex flex-col gap-12 sm:gap-16 px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
			<section className="relative flex flex-col items-center gap-5 text-center">
				<div
					aria-hidden
					className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
				/>
				<h2 className="relative text-2xl sm:text-3xl md:text-4xl font-bold">
					Find a film for any mood.
				</h2>
				<p className="relative text-on-surface-variant max-w-md">
					Describe a vibe, a plot, or a feeling — we'll find the film that
					matches.
				</p>
				<div className="relative w-full">
					<SearchForm
						icon={<Sparkles />}
						showRecommendationBadges={true}
						showIconWhenNotEmpty={false}
					/>
				</div>
			</section>
			<div className="max-w-7xl mx-auto w-full">
				<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />
			</div>
		</main>
	);
};

export default HomePage;
