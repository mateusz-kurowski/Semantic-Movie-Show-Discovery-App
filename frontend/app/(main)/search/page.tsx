import { Suspense } from "react";
import SearchPageContent from "./_components/SearchPageContent";

const Page = () => {
	return (
		<Suspense>
			<SearchPageContent />
		</Suspense>
	);
};

export default Page;
