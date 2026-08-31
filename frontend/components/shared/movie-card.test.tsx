import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/api/movies";
import { watchlistService } from "@/lib/api/watchlist";
import { renderWithQuery } from "@/test/render";
import MovieCard from "./movie-card";

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));
vi.mock("@/lib/auth/auth-client", () => ({ authClient: { useSession } }));
vi.mock("@/lib/api/watchlist", () => ({
	watchlistService: {
		addToWatchlist: vi.fn(),
		getWatchlist: vi.fn(),
		removeFromWatchlist: vi.fn(),
	},
}));

const movie = {
	id: "27205",
	poster_path: "/inception.jpg",
	release_date: "2010-07-16",
	title: "Inception",
	vote_average: 8.367,
} as Movie;

const signIn = () =>
	useSession.mockReturnValue({ data: { user: { id: "u1" } } });

beforeEach(() => {
	useSession.mockReturnValue({ data: null });
	vi.mocked(watchlistService.getWatchlist).mockResolvedValue([]);
	vi.mocked(watchlistService.addToWatchlist).mockResolvedValue(undefined);
	vi.mocked(watchlistService.removeFromWatchlist).mockResolvedValue(undefined);
});

describe("MovieCard", () => {
	it("links to the movie details page", () => {
		renderWithQuery(<MovieCard movie={movie} />);

		expect(screen.getByRole("link")).toHaveAttribute("href", "/movies/27205");
	});

	it("shows the title, release year and rating to one decimal", () => {
		renderWithQuery(<MovieCard movie={movie} />);

		expect(screen.getByText("Inception")).toBeInTheDocument();
		expect(screen.getByText("2010")).toBeInTheDocument();
		expect(screen.getByText("8.4")).toBeInTheDocument();
	});

	it("renders the poster with the title as alt text", () => {
		renderWithQuery(<MovieCard movie={movie} />);

		const poster = screen.getByRole("img", { name: "Inception" });
		expect(poster.getAttribute("src")).toContain(
			encodeURIComponent("https://image.tmdb.org/t/p/w500/inception.jpg"),
		);
	});

	it("hides the bookmark from signed-out visitors", () => {
		renderWithQuery(<MovieCard movie={movie} />);

		expect(screen.queryByRole("button")).toBeNull();
	});

	it("saves to the watchlist without following the card link", async () => {
		signIn();
		renderWithQuery(<MovieCard movie={movie} />);

		const bookmark = await screen.findByRole("button", {
			name: "Save Inception to watchlist",
		});

		// fireEvent returns false once preventDefault ran, i.e. the surrounding
		// link will not follow through to the details page.
		expect(fireEvent.click(bookmark)).toBe(false);
		await waitFor(() =>
			expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(27205),
		);
		expect(fireEvent.click(screen.getByRole("link"))).toBe(true);
	});

	it("removes a film that is already saved", async () => {
		signIn();
		vi.mocked(watchlistService.getWatchlist).mockResolvedValue([movie]);

		renderWithQuery(<MovieCard movie={movie} />);

		fireEvent.click(
			await screen.findByRole("button", {
				name: "Remove Inception from watchlist",
			}),
		);

		await waitFor(() =>
			expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith(27205),
		);
	});
});
