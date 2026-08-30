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
		variant="outline"
		className="h-auto cursor-pointer flex-col items-start gap-2.5 rounded-2xl border-border bg-card p-4.5 text-left whitespace-normal hover:border-primary/35 hover:bg-card"
		onClick={() => onClick?.(children as string)}
	>
		{Icon && (
			<span className="flex size-8 items-center justify-center rounded-[10px] bg-secondary/15 text-secondary">
				<Icon className="size-4" />
			</span>
		)}
		<span className="text-sm leading-5 font-semibold text-on-surface">
			{children}
		</span>
	</Button>
);

export default MovieRecommendationBadge;
