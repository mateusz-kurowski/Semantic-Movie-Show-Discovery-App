import type { Metadata } from "next";
import { Suspense } from "react";
import AskPageContent from "./_components/AskPageContent";

export const metadata: Metadata = {
	title: "Ask AI | ReelFind",
	description:
		"Describe a feeling, a half-remembered plot, or a film to move away from. Every suggestion is searched out of your own catalogue.",
};

// Server by default: no "use client" here. Streaming, the composer, and chat
// state all live in AskPageContent (client), so this shell stays cacheable.
const Page = () => (
	<Suspense>
		<AskPageContent />
	</Suspense>
);

export default Page;
