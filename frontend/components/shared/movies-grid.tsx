import type { Movie } from "@/lib/api/movies";
import MovieCard from "./movie-card";

const MoviesGrid = ({ movies }: { movies: Movie[] }) => {
	const notUnique = movies.filter(
		(el) => movies.filter((e) => e.id === el.id).length > 1,
	);
	console.log("not unique movies:", notUnique);

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
			{movies.map((movie) => (
				<MovieCard movie={movie} key={movie.id} />
			))}
		</div>
	);
};

export default MoviesGrid;
