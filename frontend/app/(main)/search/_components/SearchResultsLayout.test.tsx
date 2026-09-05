import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/api/movies";
import { type SearchResult, searchService } from "@/lib/api/search";
import { renderWithQuery } from "@/test/render";
import SearchResultsLayout, { SEARCH_PAGE_SIZE } from "./SearchResultsLayout";

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
			offset: 0,
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

	it("explains an empty result set instead of showing a blank grid", async () => {
		hybridSearch.mockResolvedValue([]);

		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(
			await screen.findByRole("heading", { name: "No matches found" }),
		).toBeInTheDocument();
	});

	it("hides the scroll sentinel when the first page comes back short", async () => {
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(await screen.findByText("Arrival")).toBeInTheDocument();
		expect(screen.queryByTestId("search-results-sentinel")).toBeNull();
	});

	it("loads the next page when the sentinel scrolls into view", async () => {
		const firstPage = Array.from({ length: SEARCH_PAGE_SIZE }, (_, index) =>
			resultFor(`${index}`, `Film ${index}`),
		);
		hybridSearch.mockImplementation(async (request) => {
			if ((request.offset ?? 0) === 0) return firstPage;
			return [resultFor("10", "Film 10")];
		});
		const seenCallbacks = stubIntersectionObserver();
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(await screen.findByText("Film 0")).toBeInTheDocument();
		expect(
			await screen.findByTestId("search-results-sentinel"),
		).toBeInTheDocument();

		await fireSentinels(seenCallbacks);

		expect(await screen.findByText("Film 10")).toBeInTheDocument();
		expect(hybridSearch).toHaveBeenCalledWith({
			phrase: "hopeful sci-fi",
			topK: SEARCH_PAGE_SIZE,
			offset: SEARCH_PAGE_SIZE,
		});
		// The second page came back short, so there is nothing left to fetch.
		await waitFor(() =>
			expect(screen.queryByTestId("search-results-sentinel")).toBeNull(),
		);
	});

	it("stops paging once one hundred results are loaded", async () => {
		hybridSearch.mockImplementation(async (request) => {
			const start = request.offset ?? 0;
			return Array.from({ length: SEARCH_PAGE_SIZE }, (_, index) =>
				resultFor(`${start + index}`, `Film ${start + index}`),
			);
		});
		const seenCallbacks = stubIntersectionObserver();
		renderWithQuery(<SearchResultsLayout phrase="hopeful sci-fi" />);

		expect(await screen.findByText("Film 0")).toBeInTheDocument();
		for (let loaded = SEARCH_PAGE_SIZE; loaded < 100; loaded += 10) {
			await fireSentinels(seenCallbacks);
			expect(await screen.findByText(`Film ${loaded}`)).toBeInTheDocument();
		}

		await waitFor(() => expect(hybridSearch).toHaveBeenCalledTimes(10));
		expect(hybridSearch).toHaveBeenLastCalledWith({
			phrase: "hopeful sci-fi",
			topK: SEARCH_PAGE_SIZE,
			offset: 90,
		});
		await waitFor(() =>
			expect(screen.queryByTestId("search-results-sentinel")).toBeNull(),
		);
	});
});

// jsdom ships no IntersectionObserver, so a stub class records the
// component's callbacks and the tests fire them by hand. A class (not vi.fn)
// because the component instantiates it with `new`. Only isIntersecting is
// faked because it is the only field the component reads, and the observer
// instance is omitted because the component never touches it.
type IntersectHandler = (entries: { isIntersecting: boolean }[]) => void;

const stubIntersectionObserver = () => {
	const seenCallbacks: IntersectHandler[] = [];
	class IntersectionObserverStub {
		constructor(callback: IntersectHandler) {
			seenCallbacks.push(callback);
		}
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
	return seenCallbacks;
};

const fireSentinels = async (callbacks: IntersectHandler[]) => {
	await act(async () => {
		for (const callback of callbacks) {
			callback([{ isIntersecting: true }]);
		}
	});
};
