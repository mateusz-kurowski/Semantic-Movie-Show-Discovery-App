import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComparableMovieField, type Movie, movieService } from "./movies";

const jsonResponse = (body: unknown) =>
	({ json: async () => body }) as unknown as Response;

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	fetchMock.mockResolvedValue(jsonResponse([]));
	vi.stubGlobal("fetch", fetchMock);
});

const requestedUrl = () => String(fetchMock.mock.calls[0][0]);

describe("movieService.getMovies", () => {
	it("defaults to the most popular ten films", async () => {
		await movieService.getMovies({ limit: 10 });

		expect(requestedUrl()).toBe(
			"http://api.test/movies?sortBy=popularity&order=desc&limit=10",
		);
	});

	it("passes sort field, order and limit through to the query string", async () => {
		await movieService.getMovies({
			limit: 4,
			order: "asc",
			sortBy: ComparableMovieField.RUNTIME,
		});

		expect(requestedUrl()).toBe(
			"http://api.test/movies?sortBy=runtime&order=asc&limit=4",
		);
	});

	it("returns the parsed body", async () => {
		const movies = [{ id: "1", title: "Arrival" }] as Movie[];
		fetchMock.mockResolvedValue(jsonResponse(movies));

		await expect(movieService.getMovies({ limit: 1 })).resolves.toEqual(movies);
	});
});

describe("movieService.getMovieById", () => {
	it("requests a single movie by id", async () => {
		fetchMock.mockResolvedValue(jsonResponse({ id: "42" }));

		const movie = await movieService.getMovieById("42");

		expect(requestedUrl()).toBe("http://api.test/movies/42");
		expect(movie).toEqual({ id: "42" });
	});
});

describe("movieService.getFeaturedMovies", () => {
	it("is the descending top-ten slice of the given field", async () => {
		await movieService.getFeaturedMovies(ComparableMovieField.VOTE_AVERAGE);

		expect(requestedUrl()).toBe(
			"http://api.test/movies?sortBy=vote_average&order=desc&limit=10",
		);
	});
});

describe("ComparableMovieField", () => {
	// The values are column names catalog-api sorts by; renaming one silently
	// breaks /movies, so pin them here rather than trusting the enum keys.
	it("matches the column names the API sorts on", () => {
		expect({ ...ComparableMovieField }).toEqual({
			POPULARITY: "popularity",
			RELEASE_DATE: "release_date",
			REVENUE: "revenue",
			RUNTIME: "runtime",
			VOTE_AVERAGE: "vote_average",
			VOTE_COUNT: "vote_count",
		});
	});
});
