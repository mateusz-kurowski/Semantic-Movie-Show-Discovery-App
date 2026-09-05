import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/api/movies";
import { WATCHLIST_PAGE_SIZE, watchlistService } from "@/lib/api/watchlist";
import { renderWithQuery } from "@/test/render";
import WatchlistLayout from "./WatchlistLayout";

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

const movies = [
	{ id: "1", release_date: "2016-11-11", title: "Arrival", vote_average: 7.6 },
] as Movie[];

const getWatchlist = vi.mocked(watchlistService.getWatchlist);

beforeEach(() => {
	useSession.mockReturnValue({
		data: { user: { id: "u1" } },
		isPending: false,
	});
	getWatchlist.mockReset().mockResolvedValue(movies);
});

describe("WatchlistLayout", () => {
	it("asks signed-out visitors to sign in and skips the request", () => {
		useSession.mockReturnValue({ data: null, isPending: false });

		renderWithQuery(<WatchlistLayout />);

		expect(
			screen.getByRole("heading", { name: "Sign in to see your watchlist" }),
		).toBeInTheDocument();
		expect(getWatchlist).not.toHaveBeenCalled();
	});

	it("renders a card for every saved film", async () => {
		renderWithQuery(<WatchlistLayout />);

		expect(await screen.findByText("Arrival")).toBeInTheDocument();
	});

	it("explains an empty watchlist", async () => {
		getWatchlist.mockResolvedValue([]);

		renderWithQuery(<WatchlistLayout />);

		expect(
			await screen.findByRole("heading", { name: "Your watchlist is empty" }),
		).toBeInTheDocument();
	});

	it("surfaces a failed load", async () => {
		getWatchlist.mockRejectedValue(new Error("Sign in to use your watchlist."));

		renderWithQuery(<WatchlistLayout />);

		expect(
			await screen.findByRole("heading", {
				name: "Couldn't load your watchlist",
			}),
		).toBeInTheDocument();
	});

	it("requests the first page with limit and offset", async () => {
		renderWithQuery(<WatchlistLayout />);

		expect(await screen.findByText("Arrival")).toBeInTheDocument();
		expect(getWatchlist).toHaveBeenCalledWith({
			limit: WATCHLIST_PAGE_SIZE,
			offset: 0,
		});
	});

	it("hides the scroll sentinel when the first page comes back short", async () => {
		renderWithQuery(<WatchlistLayout />);

		expect(await screen.findByText("Arrival")).toBeInTheDocument();
		expect(screen.queryByTestId("watchlist-sentinel")).toBeNull();
	});

	it("loads the next page when the sentinel scrolls into view", async () => {
		const firstPage = Array.from({ length: WATCHLIST_PAGE_SIZE }, (_, index) =>
			savedMovie(index),
		);
		getWatchlist.mockImplementation(async (params) => {
			if ((params?.offset ?? 0) === 0) return firstPage;
			return [savedMovie(WATCHLIST_PAGE_SIZE)];
		});
		const seenCallbacks = stubIntersectionObserver();
		renderWithQuery(<WatchlistLayout />);

		expect(await screen.findByText("Saved 0")).toBeInTheDocument();
		expect(await screen.findByTestId("watchlist-sentinel")).toBeInTheDocument();

		await fireSentinels(seenCallbacks);

		expect(await screen.findByText("Saved 20")).toBeInTheDocument();
		expect(getWatchlist).toHaveBeenCalledWith({
			limit: WATCHLIST_PAGE_SIZE,
			offset: WATCHLIST_PAGE_SIZE,
		});
		// The second page came back short, so there is nothing left to fetch.
		await waitFor(() =>
			expect(screen.queryByTestId("watchlist-sentinel")).toBeNull(),
		);
	});
});

const savedMovie = (index: number): Movie =>
	({
		id: `${index + 1}`,
		release_date: "2016-11-11",
		title: `Saved ${index}`,
		vote_average: 7.6,
	}) as Movie;

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
