import { Card } from "../ui/card";

const MovieCard = ({ movie }) => {
  return <Card>{movie.title}</Card>;
};

export default MovieCard;
