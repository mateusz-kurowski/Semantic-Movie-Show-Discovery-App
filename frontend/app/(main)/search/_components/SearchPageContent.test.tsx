import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchService } from "@/lib/api/search";
import { renderWithQuery } from "@/test/render";
import SearchPageContent from "./SearchPageContent";

const { push, searchParams } = vi.hoisted(() => ({
	push: vi.fn(),
	searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
	useSearchParams: () => searchParams,
}));
vi.mock("@/lib/api/search", () => ({
	searchService: { hybridSearch: vi.fn() },
}));

beforeEach(() => {
	push.mockReset();
	vi.mocked(searchService.hybridSearch).mockReset().mockResolvedValue([]);
});

const renderWithQueryParam = (q: string | null) => {
	searchParams.delete("q");
	if (q !== null) {
		searchParams.set("q", q);
	}
	return renderWithQuery(<SearchPageContent />);
};

describe("SearchPageContent", () => {
	it("searches for the q parameter", async () => {
		renderWithQueryParam("hopeful sci-fi");

		expect(
			screen.getByRole("heading", { name: /hopeful sci-fi/ }),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(searchService.hybridSearch).toHaveBeenCalledWith({
				phrase: "hopeful sci-fi",
				topK: 10,
			}),
		);
	});

	it("trims surrounding whitespace out of the phrase", async () => {
		renderWithQueryParam("  hopeful sci-fi  ");

		await waitFor(() =>
			expect(searchService.hybridSearch).toHaveBeenCalledWith({
				phrase: "hopeful sci-fi",
				topK: 10,
			}),
		);
	});

	it("sends the user home when there is nothing to search for", async () => {
		const { container } = renderWithQueryParam(null);

		await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
		expect(container).toBeEmptyDOMElement();
		expect(searchService.hybridSearch).not.toHaveBeenCalled();
	});

	it("treats a blank phrase as no phrase at all", async () => {
		renderWithQueryParam("   ");

		await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
		expect(searchService.hybridSearch).not.toHaveBeenCalled();
	});
});
