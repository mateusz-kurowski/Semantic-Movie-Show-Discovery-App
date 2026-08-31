import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "./movies";
import { watchlistService } from "./watchlist";

const fetchMock = vi.fn();

const ok = (body: unknown) =>
	({ json: async () => body, ok: true, status: 200 }) as unknown as Response;

beforeEach(() => {
	fetchMock.mockReset();
	fetchMock.mockResolvedValue(ok([]));
	vi.stubGlobal("fetch", fetchMock);
});

describe("watchlistService", () => {
	it("sends the session cookie when reading the watchlist", async () => {
		const movies = [{ id: "1", title: "Arrival" }] as Movie[];
		fetchMock.mockResolvedValue(ok(movies));

		await expect(watchlistService.getWatchlist()).resolves.toEqual(movies);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("http://api.test/watchlist");
		expect(init.credentials).toBe("include");
	});

	it("posts the movie id when saving", async () => {
		await watchlistService.addToWatchlist(27205);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("http://api.test/watchlist");
		expect(init.method).toBe("POST");
		expect(JSON.parse(init.body)).toEqual({ movieId: 27205 });
	});

	it("deletes by movie id", async () => {
		await watchlistService.removeFromWatchlist(27205);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("http://api.test/watchlist/27205");
		expect(init.method).toBe("DELETE");
	});

	it("turns a 401 into an actionable message rather than parsing the body", async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 401 } as Response);

		await expect(watchlistService.getWatchlist()).rejects.toThrow(
			"Sign in to use your watchlist.",
		);
	});
});
