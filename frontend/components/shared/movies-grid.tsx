import type { Movie } from "@/lib/api/movies";
import MovieCard from "./movie-card";

const MoviesGrid = ({ movies }: { movies: Movie[] }) => {
	return (
		<div className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
			{movies.map((movie) => (
				<MovieCard movie={movie} key={movie.id} />
			))}
		</div>
	);
};

export default MoviesGrid;
