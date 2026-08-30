import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ComparableMovieField,
	type Movie,
	movieService,
} from "@/lib/api/movies";
import { renderWithQuery } from "@/test/render";
import FeaturedMoviesGrid from "./featured-movies-grid";

vi.mock("@/lib/api/movies", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/api/movies")>()),
	movieService: { getFeaturedMovies: vi.fn(), getMovies: vi.fn() },
}));

const movies = [
	{ id: "1", release_date: "2016-11-11", title: "Arrival", vote_average: 7.6 },
] as Movie[];

const getFeaturedMovies = vi.mocked(movieService.getFeaturedMovies);
const getMovies = vi.mocked(movieService.getMovies);

beforeEach(() => {
	getFeaturedMovies.mockReset().mockResolvedValue(movies);
	getMovies.mockReset().mockResolvedValue(movies);
});

describe("FeaturedMoviesGrid", () => {
	it("loads the descending top ten and links to the full list", async () => {
		renderWithQuery(
			<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />,
		);

		expect(
			screen.getByRole("heading", { name: "Popular discoveries" }),
		).toBeInTheDocument();
		expect(await screen.findByText("Arrival")).toBeInTheDocument();
		expect(getFeaturedMovies).toHaveBeenCalledWith(
			ComparableMovieField.POPULARITY,
		);
		expect(getMovies).not.toHaveBeenCalled();
		expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
			"href",
			"/discover/popular",
		);
	});

	it("switches to a sorted query for an ascending rail", async () => {
		renderWithQuery(
			<FeaturedMoviesGrid
				type={ComparableMovieField.RUNTIME}
				order="asc"
				title="Under two hours"
			/>,
		);

		await waitFor(() =>
			expect(getMovies).toHaveBeenCalledWith({
				limit: 10,
				order: "asc",
				sortBy: ComparableMovieField.RUNTIME,
			}),
		);
		expect(getFeaturedMovies).not.toHaveBeenCalled();
		expect(
			screen.getByRole("heading", { name: "Under two hours" }),
		).toBeInTheDocument();
	});

	it("hides the view-all link on rails that have no page behind them", async () => {
		renderWithQuery(
			<FeaturedMoviesGrid
				type={ComparableMovieField.RUNTIME}
				order="asc"
				title="Under two hours"
			/>,
		);

		await screen.findByText("Arrival");
		expect(screen.queryByRole("link", { name: "View all" })).toBeNull();
	});

	it("shows no cards until the query resolves", async () => {
		const { promise, resolve } = Promise.withResolvers<Movie[]>();
		getFeaturedMovies.mockReturnValue(promise);

		renderWithQuery(
			<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />,
		);

		expect(screen.queryByText("Arrival")).toBeNull();
		resolve(movies);
		expect(await screen.findByText("Arrival")).toBeInTheDocument();
	});

	it("surfaces a failed fetch instead of rendering an empty rail", async () => {
		getFeaturedMovies.mockRejectedValue(new Error("Failed to fetch"));

		renderWithQuery(
			<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />,
		);

		expect(
			await screen.findByText("Error: Failed to fetch"),
		).toBeInTheDocument();
	});

	it("scrolls the rail in both directions", async () => {
		const user = userEvent.setup();
		renderWithQuery(
			<FeaturedMoviesGrid type={ComparableMovieField.POPULARITY} />,
		);
		await screen.findByText("Arrival");

		await user.click(screen.getByRole("button", { name: "Scroll right" }));
		await user.click(screen.getByRole("button", { name: "Scroll left" }));

		expect(Element.prototype.scrollBy).toHaveBeenNthCalledWith(1, {
			behavior: "smooth",
			left: 480,
		});
		expect(Element.prototype.scrollBy).toHaveBeenNthCalledWith(2, {
			behavior: "smooth",
			left: -480,
		});
	});
});
