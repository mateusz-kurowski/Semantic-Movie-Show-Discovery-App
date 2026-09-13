import { Suspense } from "react";
import SearchPageContent from "./_components/SearchPageContent";

const Page = () => {
	return (
		<Suspense fallback={null}>
			<SearchPageContent />
		</Suspense>
	);
};

export default Page;
