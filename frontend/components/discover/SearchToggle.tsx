import type { PropsWithChildren } from "react";
import { ToggleGroupItem } from "../ui/toggle-group";

interface SearchToggleProps {
	isActive: boolean;
	value: string;
}
const activeStyle = "bg-foreground/10 text-on-surface";
const SearchToggle = ({
	isActive,
	value,
	children,
}: PropsWithChildren<SearchToggleProps>) => {
	return (
		<ToggleGroupItem
			value={value}
			className={`h-8 cursor-pointer rounded-full px-3 text-sm font-semibold text-outline transition-colors sm:h-10.5 sm:px-4 ${isActive ? activeStyle : value === "ai" ? "text-primary hover:text-primary-fixed" : "hover:text-on-surface"}`}
		>
			{children}
		</ToggleGroupItem>
	);
};

export default SearchToggle;
