"use client";

import { Suspense } from "react";
import SearchResultsLayout from "./_components/SearchResultsLayout";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SearchResultsLayout />
		</Suspense>
	);
};

export default Page;
