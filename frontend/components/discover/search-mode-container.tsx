"use client";
import { useState } from "react";
import { ToggleGroup } from "../ui/toggle-group";
import SearchToggle from "./SearchToggle";

const SearchModeContainer = () => {
	const [isSearchMode, setSearchMode] = useState<boolean>(true);
	return (
		// todo: user should be able to save his preference in local storage or in the user profile
		<ToggleGroup
			defaultValue={["search"]}
			multiple={false}
			onValueChange={(value) => setSearchMode(value[0] === "search")}
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
