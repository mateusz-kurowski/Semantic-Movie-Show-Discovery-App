import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "./movies";
import { type SearchResult, searchService } from "./search";

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	fetchMock.mockResolvedValue({
		json: async () => [],
	} as unknown as Response);
	vi.stubGlobal("fetch", fetchMock);
});

describe("searchService.hybridSearch", () => {
	it("posts the phrase and topK as JSON", async () => {
		await searchService.hybridSearch({ phrase: "hopeful sci-fi", topK: 10 });

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("http://api.test/search/hybrid");
		expect(init.method).toBe("POST");
		expect(init.headers).toEqual({ "Content-Type": "application/json" });
		expect(JSON.parse(init.body)).toEqual({
			phrase: "hopeful sci-fi",
			topK: 10,
		});
	});

	it("omits topK when the caller does not set one", async () => {
		await searchService.hybridSearch({ phrase: "noir" });

		expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
			phrase: "noir",
		});
	});

	it("returns the scored results untouched", async () => {
		// catalog-api fuses with RRF, so score is a rank sum (~0.03), not a 0-1
		// similarity — nothing in the client may rescale it.
		const results: SearchResult[] = [
			{
				id: 1,
				payload: { id: "1", title: "Arrival" } as Movie,
				score: 0.032786883,
				version: 0,
			},
		];
		fetchMock.mockResolvedValue({
			json: async () => results,
		} as unknown as Response);

		await expect(
			searchService.hybridSearch({ phrase: "arrival" }),
		).resolves.toEqual(results);
	});
});
