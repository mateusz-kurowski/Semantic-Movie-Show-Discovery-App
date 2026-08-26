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
			<div className="top-container relative w-full h-[45vh] sm:h-[55vh] md:h-[60vh]">
				<Image
					className="object-cover"
					src={getTmdbImageUrl(movie.backdrop_path, "original")}
					alt={movie.title}
					fill
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
				<div className="badges-and-title absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 sm:p-6">
					<div className="badges flex flex-wrap gap-1.5">
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
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
						{movie.title}
					</h1>
				</div>
			</div>
			<div>
				<div className="overview flex flex-col md:flex-row md:justify-between gap-4 p-4 sm:p-6">
					<div>
						<p className="w-full md:w-2/3">{movie.overview}</p>
						<div className="genres flex flex-wrap gap-1.5 mt-2">
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
					<div className="actions flex flex-col gap-2 w-full sm:w-auto">
						<Button className="flex justify-center bg-primary text-primary-foreground cursor-pointer rounded-sm w-full sm:w-auto">
							<Play /> Watch Trailer
						</Button>
						<Button className="flex justify-center bg-black cursor-pointer rounded-sm text-white w-full sm:w-auto">
							<Plus /> Add to Watchlist
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MovieBanner;
