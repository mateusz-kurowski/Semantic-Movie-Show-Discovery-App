import { Bookmark } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";

const Page = () => {
	return (
		<EmptyState
			icon={Bookmark}
			title="Your watchlist is empty"
			description="Movies and shows you save will show up here."
		/>
	);
};

export default Page;
