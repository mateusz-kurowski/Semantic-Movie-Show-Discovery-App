import { Button } from "@base-ui/react/button";
import { format } from "date-fns";
import { Play, Plus, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/lib/api/movies";
import { getTmdbImageUrl } from "@/lib/utils/tmdbUtils";

interface MovieBannerProps {
	movie: Movie;
}

const MovieBanner = ({ movie }: MovieBannerProps) => {
	return (
		<>
			<div className="top-container relative">
				<Image
					className="w-full object-cover relative"
					src={getTmdbImageUrl(movie.backdrop_path, "original")}
					alt={movie.title}
					width={500}
					height={300}
				/>
				<div className="badges-and-title flex gap-1 absolute bottom-2 left-2">
					<div className="badges">
						<Badge className="backdrop-blur-2xl">
							{format(new Date(movie.release_date), "yyyy")}
						</Badge>
						<Badge className="backdrop-blur-2xl">
							{`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}
						</Badge>
						<Badge className="text-yellow-500 backdrop-blur-2xl bg-transparent">
							{movie.vote_average.toFixed(1)} <Star />
						</Badge>
					</div>
					<h1 className="text-4xl font-bold">{movie.title}</h1>
				</div>
			</div>
			<div>
				<div className="overview flex justify-between">
					<div>
						<p className="w-2/3">{movie.overview}</p>
						<div className="genres flex gap-1.5">
							{movie.genres.map((genre) => (
								<Badge
									key={genre}
									className="text-secondary bg-transparent border-secondary"
								>
									{genre}
								</Badge>
							))}
						</div>
					</div>
					<div className="actions flex-col gap-2">
						<Button className="flex bg-primary text-primary-foreground cursor-pointer rounded-sm">
							<Play /> Watch Trailer
						</Button>
						<Button className="flex bg-black cursor-pointer rounded-sm text-white ">
							<Plus /> Add to Watchlist
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MovieBanner;
