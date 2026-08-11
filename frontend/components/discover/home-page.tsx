"use client";
import { Sparkles } from "lucide-react";
import FeaturedMoviesGrid from "./featured-movies-grid";
import SearchForm from "./main-search";

const HomePage = () => {
	return (
		<main className="flex flex-col items-center p-5 gap-5">
			<h2 className="text-4xl font-bold">Find a film for any mood.</h2>
			<SearchForm
				icon={<Sparkles />}
				showRecommendationBadges={true}
				showIconWhenNotEmpty={false}
			/>
			<FeaturedMoviesGrid type="popularity" />
		</main>
	);
};

export default HomePage;
