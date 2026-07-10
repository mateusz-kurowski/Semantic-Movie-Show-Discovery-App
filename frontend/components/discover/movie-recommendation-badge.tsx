import { LucideIcon } from "lucide-react";
import { PropsWithChildren } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface MovieRecommendationBadgeProps {
  icon?: LucideIcon;
}
const MovieRecommendationBadge = ({
  children,
  icon: Icon,
}: PropsWithChildren<MovieRecommendationBadgeProps>) => (
  <Button className="bg-on-secondary-container text-secondary border-secondary border cursor-pointer">
    {Icon && <Icon data-icon="inline-start" />}
    {children}
  </Button>
);

export default MovieRecommendationBadge;
