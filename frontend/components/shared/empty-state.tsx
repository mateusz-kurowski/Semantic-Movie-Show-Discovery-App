import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
	return (
		<div className="flex flex-col items-center text-center gap-3 py-16 px-4">
			<Icon className="size-10 text-on-surface-variant" />
			<h1 className="text-xl font-bold">{title}</h1>
			<p className="text-on-surface-variant max-w-sm">{description}</p>
		</div>
	);
};

export default EmptyState;
