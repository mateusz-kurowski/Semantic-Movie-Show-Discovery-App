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
		type="button"
		className="h-auto w-full min-w-0 cursor-pointer flex-row items-center justify-start gap-2.5 self-stretch overflow-hidden rounded-2xl border-border bg-card p-4.5 text-left whitespace-nowrap hover:border-primary/35 hover:bg-card"
		onClick={() => onClick?.(children as string)}
	>
		{Icon && (
			<span
				aria-hidden="true"
				className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-secondary/15 text-secondary"
			>
				<Icon className="size-4" />
			</span>
		)}
		<span className="min-w-0 flex-1 overflow-hidden text-sm leading-5 font-semibold whitespace-nowrap text-ellipsis text-on-surface">
			{children}
		</span>
	</Button>
);

export default MovieRecommendationBadge;
