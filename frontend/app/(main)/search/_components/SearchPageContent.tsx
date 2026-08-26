"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import SearchResultsLayout from "./SearchResultsLayout";

const SearchPageContent = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const phrase = searchParams.get("q")?.trim();

	useEffect(() => {
		if (!phrase) {
			router.push("/");
		}
	}, [phrase, router]);

	if (!phrase) return null;

	return <SearchResultsLayout phrase={phrase} />;
};

export default SearchPageContent;
