import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
	return (
		<div className="flex flex-1 flex-col items-center gap-4 px-4 py-24 text-center">
			<span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-outline">
				<Icon className="size-6" />
			</span>
			<h1 className="text-lg leading-6.5 font-semibold">{title}</h1>
			<p className="max-w-sm text-on-surface-variant">{description}</p>
		</div>
	);
};

export default EmptyState;
