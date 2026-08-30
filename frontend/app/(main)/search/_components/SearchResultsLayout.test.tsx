import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/api/movies";
import { type SearchResult, searchService } from "@/lib/api/search";
import { renderWithQuery } from "@/test/render";
import SearchResultsLayout from "./SearchResultsLayout";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/api/search", () => ({
	searchService: { hybridSearch: vi.fn() },
}));

const hybridSearch = vi.mocked(searchService.hybridSearch);

const resultFor = (id: string, title: string): SearchResult => ({
	id: Number(id),
	payload: {
		id,
		poster_path: `/${id}.jpg`,
		release_date: "2016-11-11",
		title,
		vote_average: 7.6,
	} as Movie,
	score: 0.0327,
	version: 0,
});

beforeEach(() => {
	hybridSearch
		.mockReset()
		.mockResolvedValue([
			resultFor("1", "Arrival"),
			resultFor("2", "Annihilation"),
		]);
});

describe("SearchResultsLayout", () => {
	it("asks the API for the top ten hybrid matches", async () => {
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		await screen.findByText("Arrival");
		expect(hybridSearch).toHaveBeenCalledWith({
			phrase: "hopeful sci-fi",
			topK: 10,
		});
	});

	it("headlines the phrase and counts what came back", async () => {
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(
			screen.getByRole("heading", { name: /hopeful sci-fi/ }),
		).toBeInTheDocument();
		expect(await screen.findByText("2 films")).toBeInTheDocument();
		expect(screen.getByText(/ranked by meaning/)).toBeInTheDocument();
	});

	it("renders a card for every payload", async () => {
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(await screen.findByText("Arrival")).toBeInTheDocument();
		expect(screen.getByText("Annihilation")).toBeInTheDocument();
	});

	it("keeps the phrase in the inline search box for refinement", () => {
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(screen.getByRole("textbox")).toHaveValue("hopeful sci-fi");
	});

	it("explains a failed search instead of showing an empty grid", async () => {
		hybridSearch.mockRejectedValue(new Error("Failed to fetch"));

		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(
			await screen.findByRole("heading", { name: "Couldn't run that search" }),
		).toBeInTheDocument();
		expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
	});

	it("shows no count until the results arrive", () => {
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(screen.queryByText(/ranked by meaning/)).toBeNull();
	});
});
