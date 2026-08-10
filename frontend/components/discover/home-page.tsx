"use client";
import { Sparkles } from "lucide-react";
import SearchForm from "./main-search";
import MoviesGridComponent from "./movies-grid";

const HomePage = () => {
	return (
		<main className="flex flex-col items-center p-5 gap-5">
			<h2 className="text-4xl font-bold">Find a film for any mood.</h2>
			<SearchForm
				icon={<Sparkles />}
				showRecommendationBadges={true}
				showIconWhenNotEmpty={false}
			/>
			<MoviesGridComponent type="popularity" />
		</main>
	);
};

export default HomePage;
