"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToggleGroup } from "../ui/toggle-group";
import SearchToggle from "./SearchToggle";

interface SearchModeContainerProps {
	query: string;
}

const SearchModeContainer = ({ query }: SearchModeContainerProps) => {
	const router = useRouter();
	const [isSearchMode, setSearchMode] = useState<boolean>(true);
	return (
		// todo: user should be able to save his preference in local storage or in the user profile
		<ToggleGroup
			defaultValue={["search"]}
			multiple={false}
			onValueChange={(value) => {
				// Base UI deselects the active item on a repeat click (value: []).
				// Ignore that rather than reading it as "switched away from Search".
				const mode = value[0];
				if (!mode) return;

				setSearchMode(mode === "search");
				if (mode === "ai") {
					const trimmed = query.trim();
					router.push(
						trimmed ? `/ask?q=${encodeURIComponent(trimmed)}` : "/ask",
					);
				}
			}}
			className="gap-0.5 rounded-full bg-surface-container-lowest/70 p-[3px]"
		>
			<SearchToggle isActive={!isSearchMode} value="ai">
				Ask AI
			</SearchToggle>
			<SearchToggle isActive={isSearchMode} value="search">
				Search
			</SearchToggle>
		</ToggleGroup>
	);
};

export default SearchModeContainer;
