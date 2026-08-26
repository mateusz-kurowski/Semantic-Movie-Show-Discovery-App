"use client";
import { Sparkles } from "lucide-react";
import { ComparableMovieField } from "@/lib/api/movies";
import FeaturedMoviesGrid from "./featured-movies-grid";
import SearchForm from "./main-search";

const HomePage = () => {
	return (
		<main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 gap-5">
			<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
				Find a film for any mood.
			</h2>
			<SearchForm
				icon={<Sparkles />}
				showRecommendationBadges={true}
				showIconWhenNotEmpty={false}
			/>
			<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />
		</main>
	);
};

export default HomePage;
