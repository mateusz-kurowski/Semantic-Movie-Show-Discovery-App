import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/api/movies";
import { renderWithQuery } from "@/test/render";
import MoviesGrid from "./movies-grid";

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));
vi.mock("@/lib/auth/auth-client", () => ({ authClient: { useSession } }));
vi.mock("@/lib/api/watchlist", () => ({
	watchlistService: {
		addToWatchlist: vi.fn(),
		getWatchlist: vi.fn(),
		removeFromWatchlist: vi.fn(),
	},
}));

beforeEach(() => {
	useSession.mockReturnValue({ data: null });
});

const movies = [
	{ id: "1", release_date: "2016-11-11", title: "Arrival", vote_average: 7.6 },
	{
		id: "2",
		release_date: "2014-11-05",
		title: "Interstellar",
		vote_average: 8.4,
	},
] as Movie[];

describe("MoviesGrid", () => {
	it("renders one card per movie", () => {
		renderWithQuery(<MoviesGrid movies={movies} />);

		expect(screen.getAllByRole("link")).toHaveLength(2);
		expect(screen.getByText("Arrival")).toBeInTheDocument();
		expect(screen.getByText("Interstellar")).toBeInTheDocument();
	});

	it("renders nothing for an empty result set", () => {
		renderWithQuery(<MoviesGrid movies={[]} />);

		expect(screen.queryAllByRole("link")).toHaveLength(0);
	});
});
