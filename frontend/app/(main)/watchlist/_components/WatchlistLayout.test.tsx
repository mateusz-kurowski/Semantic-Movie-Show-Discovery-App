import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/api/movies";
import { watchlistService } from "@/lib/api/watchlist";
import { renderWithQuery } from "@/test/render";
import WatchlistLayout from "./WatchlistLayout";

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));
vi.mock("@/lib/auth/auth-client", () => ({ authClient: { useSession } }));
vi.mock("@/lib/api/watchlist", () => ({
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
});
