import MoviesGrid from "@/components/shared/movies-grid";
import { ComparableMovieField, movieService } from "@/lib/api/movies";

const PopularPage = async () => {
	const movies = await movieService.getFeaturedMovies(
		ComparableMovieField.POPULARITY,
	);

	return (
		<main className="flex flex-col items-center p-5 gap-5">
			<h1 className="text-3xl font-bold">Popular movies</h1>
			<MoviesGrid movies={movies} />
		</main>
	);
};

export default PopularPage;
