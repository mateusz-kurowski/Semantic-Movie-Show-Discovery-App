import type { PropsWithChildren } from "react";
import { ToggleGroupItem } from "../ui/toggle-group";

interface SearchToggleProps {
	isActive: boolean;
	value: string;
}
const activeStyle = "text-primary shadow-md bg-surface-";
const SearchToggle = ({
	isActive,
	value,
	children,
}: PropsWithChildren<SearchToggleProps>) => {
	return (
		<ToggleGroupItem
			value={value}
			className={`text-on-surface-variant ${isActive ? activeStyle : ""} rounded-sm cursor-pointer p-3 transition-colors`}
		>
			{children}
		</ToggleGroupItem>
	);
};

export default SearchToggle;
