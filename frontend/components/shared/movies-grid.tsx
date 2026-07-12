import { Movie } from "@/lib/api/movies";
import { movie } from "../../../catalog-api/src/db/schema";
import MovieCard from "./movie-card";

const MoviesGrid = ({ movies }: { movies: Movie[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <MovieCard movie={movie} key={movie.id} />
      ))}
    </div>
  );
};

export default MoviesGrid;
