import type { LucideIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Button } from "../ui/button";

interface MovieRecommendationBadgeProps {
	icon?: LucideIcon;
	onClick?: (query: string) => void;
}
const MovieRecommendationBadge = ({
	children,
	icon: Icon,
	onClick,
}: PropsWithChildren<MovieRecommendationBadgeProps>) => (
	<Button
		className="bg-on-secondary-container text-secondary border-secondary border cursor-pointer"
		onClick={() => onClick?.(children as string)}
	>
		{Icon && <Icon data-icon="inline-start" />}
		{children}
	</Button>
);

export default MovieRecommendationBadge;
