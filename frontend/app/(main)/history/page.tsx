import { Clock } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";

const Page = () => {
	return (
		<EmptyState
			icon={Clock}
			title="No watch history yet"
			description="Films you've explored will show up here."
		/>
	);
};

export default Page;
