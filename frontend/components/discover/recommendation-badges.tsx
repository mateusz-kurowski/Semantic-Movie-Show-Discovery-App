import { BrainCog, Clapperboard, Clock } from "lucide-react";
import MovieRecommendationBadge from "./movie-recommendation-badge";

interface RecommendationBadgesProps {
	onClick?: (query: string) => void;
}

const RecommendationBadges = ({ onClick }: RecommendationBadgesProps) => {
	return (
		<div className="flex flex-wrap gap-2 mt-2 justify-center">
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
