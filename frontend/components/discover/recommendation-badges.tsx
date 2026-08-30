import { BrainCog, Clapperboard, Clock } from "lucide-react";
import MovieRecommendationBadge from "./movie-recommendation-badge";

interface RecommendationBadgesProps {
	onClick?: (query: string) => void;
}

const RecommendationBadges = ({ onClick }: RecommendationBadgesProps) => {
	return (
		<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
			<MovieRecommendationBadge icon={Clapperboard} onClick={onClick}>
				Like Interstellar, but lighter
			</MovieRecommendationBadge>
			<MovieRecommendationBadge icon={BrainCog} onClick={onClick}>
				90s psychological thrillers
			</MovieRecommendationBadge>
			<MovieRecommendationBadge icon={Clock} onClick={onClick}>
				Feel-good films under 2 hours
			</MovieRecommendationBadge>
		</div>
	);
};

export default RecommendationBadges;
