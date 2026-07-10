import { BrainCog, Clapperboard, Clock } from "lucide-react";
import MovieRecommendationBadge from "./movie-recommendation-badge";

const RecommendationBadges = () => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 justify-center">
      <MovieRecommendationBadge icon={Clapperboard}>
        Like Interstellar, but lighter
      </MovieRecommendationBadge>
      <MovieRecommendationBadge icon={BrainCog}>
        90s psychological thrillers
      </MovieRecommendationBadge>
      <MovieRecommendationBadge icon={Clock}>
        Feel-good films under 2 hours
      </MovieRecommendationBadge>
    </div>
  );
};

export default RecommendationBadges;
