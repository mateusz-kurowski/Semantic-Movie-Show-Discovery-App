import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ComparableMovieField,
	type Movie,
	movieService,
} from "@/lib/api/movies";
import { renderWithQuery } from "@/test/render";
import PopularPage from "./page";

// Mirrors the page size in ./page.tsx (route files cannot export arbitrary
// values in Next 16, so the test keeps its own copy of the expectation).
const POPULAR_PAGE_SIZE = 10;

vi.mock("@/lib/api/movies", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/api/movies")>()),
	movieService: { getFeaturedMovies: vi.fn(), getMovies: vi.fn() },
}));
const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));
vi.mock("@/lib/auth/auth-client", () => ({ authClient: { useSession } }));
vi.mock("@/lib/api/watchlist", () => ({
	WATCHLIST_PAGE_SIZE: 20,
	watchlistService: {
		addToWatchlist: vi.fn(),
		getWatchlist: vi.fn(),
		removeFromWatchlist: vi.fn(),
	},
}));

const popularMovie = (index: number): Movie =>
	({
		id: `${index + 1}`,
		release_date: "2016-11-11",
		title: `Popular ${index}`,
		vote_average: 7.6,
	}) as Movie;

const getMovies = vi.mocked(movieService.getMovies);

beforeEach(() => {
	useSession.mockReturnValue({ data: null });
	getMovies.mockReset().mockResolvedValue([popularMovie(0)]);
});

describe("PopularPage", () => {
	it("requests the first page of popular movies", async () => {
		renderWithQuery(<PopularPage />);

		expect(await screen.findByText("Popular 0")).toBeInTheDocument();
		expect(getMovies).toHaveBeenCalledWith({
			sortBy: ComparableMovieField.POPULARITY,
			order: "desc",
			limit: POPULAR_PAGE_SIZE,
			offset: 0,
		});
	});

	it("hides the scroll sentinel when the first page comes back short", async () => {
		renderWithQuery(<PopularPage />);

		expect(await screen.findByText("Popular 0")).toBeInTheDocument();
		expect(screen.queryByTestId("popular-movies-sentinel")).toBeNull();
	});

	it("loads the next page when the sentinel scrolls into view", async () => {
		const firstPage = Array.from({ length: POPULAR_PAGE_SIZE }, (_, index) =>
			popularMovie(index),
		);
		getMovies.mockImplementation(async (params) => {
			if ((params.offset ?? 0) === 0) return firstPage;
			return [popularMovie(POPULAR_PAGE_SIZE)];
		});
		const seenCallbacks = stubIntersectionObserver();
		renderWithQuery(<PopularPage />);

		expect(await screen.findByText("Popular 0")).toBeInTheDocument();
		expect(
			await screen.findByTestId("popular-movies-sentinel"),
		).toBeInTheDocument();

		await fireSentinels(seenCallbacks);

		expect(await screen.findByText("Popular 10")).toBeInTheDocument();
		expect(getMovies).toHaveBeenCalledWith({
			sortBy: ComparableMovieField.POPULARITY,
			order: "desc",
			limit: POPULAR_PAGE_SIZE,
			offset: POPULAR_PAGE_SIZE,
		});
		// The second page came back short, so there is nothing left to fetch.
		await waitFor(() =>
			expect(screen.queryByTestId("popular-movies-sentinel")).toBeNull(),
		);
	});

	it("explains an empty catalogue instead of showing a blank grid", async () => {
		getMovies.mockResolvedValue([]);

		renderWithQuery(<PopularPage />);

		expect(
			await screen.findByRole("heading", { name: "No popular movies yet" }),
		).toBeInTheDocument();
	});

	it("surfaces a failed load", async () => {
		getMovies.mockRejectedValue(new Error("Failed to fetch"));

		renderWithQuery(<PopularPage />);

		expect(
			await screen.findByRole("heading", {
				name: "Couldn't load popular movies",
			}),
		).toBeInTheDocument();
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
