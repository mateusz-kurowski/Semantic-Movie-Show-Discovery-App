import type { Metadata } from "next";
import HomePage from "@/components/discover/home-page";

export const metadata: Metadata = {
	title: "ReelFind — Describe the film you can't name",
	description:
		"A self-hosted semantic movie & show discovery app — find films by vibe, mood, or natural language. Powered by hybrid vector search (Qdrant) and LLM-generated embeddings.",
};

const Page = () => {
	return <HomePage />;
};

export default Page;
