import { Sparkles } from "lucide-react";
import { ComparableMovieField } from "@/lib/api/movies";
import FeaturedMoviesGrid from "./featured-movies-grid";
import SearchForm from "./main-search";

const HomePage = () => {
	return (
		<main className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 py-12 sm:gap-20 sm:py-16">
			<section
				aria-labelledby="discover-heading"
				className="relative flex flex-col items-center gap-5 px-5 text-center lg:px-16"
			>
				<div
					aria-hidden
					className="pointer-events-none absolute -top-35 left-1/2 h-105 w-225 max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,--theme(--color-primary/22%),transparent)]"
				/>
				<span className="relative inline-flex h-7.5 items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3.5 text-xs font-semibold tracking-[0.1em] text-secondary uppercase">
					<span className="size-1.5 rounded-full bg-secondary shadow-[0_0_10px_var(--color-secondary)]" />
					HYBRID VECTOR SEARCH
				</span>
				<h1
					id="discover-heading"
					className="relative max-w-4xl text-[32px] leading-10 font-bold tracking-[-0.04em] sm:text-5xl sm:leading-13 md:text-6xl md:leading-16"
				>
					Describe the film you can&apos;t name.
				</h1>
				<p className="relative max-w-xl text-base leading-6 text-on-surface-variant sm:text-lg sm:leading-7">
					A self-hosted semantic movie &amp; show discovery app — find films by
					vibe, mood, or natural language. Powered by hybrid vector search
					(Qdrant) and LLM-generated embeddings.
				</p>
				<p className="relative max-w-xl text-sm leading-5 text-on-surface-variant">
					ReelFind searches meaning, not keywords — try{" "}
					<span className="text-on-surface">
						&ldquo;cozy rainy-day mystery with a twist&rdquo;
					</span>
					.
				</p>
				<div className="relative w-full">
					<SearchForm
						icon={<Sparkles />}
						showRecommendationBadges={true}
						showIconWhenNotEmpty={false}
					/>
				</div>
			</section>
			<section aria-label="Catalog discovery" className="flex flex-col gap-9">
				<div className="flex flex-col gap-2 px-5 lg:px-16">
					<p className="text-xs font-semibold tracking-[0.1em] text-secondary uppercase">
						Catalog discovery
					</p>
					<p className="max-w-2xl text-sm leading-5 text-on-surface-variant">
						ReelFind — Self-hosted, polyglot semantic search + AI-chat movie
						discovery platform over ~930k TMDB movies.
					</p>
				</div>
				<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />
				<FeaturedMoviesGrid
					type={ComparableMovieField.RUNTIME}
					order="asc"
					title="Under two hours"
				/>
			</section>
		</main>
	);
};

export default HomePage;
