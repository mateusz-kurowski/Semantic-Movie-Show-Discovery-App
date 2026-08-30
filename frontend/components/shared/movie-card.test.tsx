import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Movie } from "@/lib/api/movies";
import MovieCard from "./movie-card";

const movie = {
	id: "27205",
	poster_path: "/inception.jpg",
	release_date: "2010-07-16",
	title: "Inception",
	vote_average: 8.367,
} as Movie;

describe("MovieCard", () => {
	it("links to the movie details page", () => {
		render(<MovieCard movie={movie} />);

		expect(screen.getByRole("link")).toHaveAttribute("href", "/movies/27205");
	});

	it("shows the title, release year and rating to one decimal", () => {
		render(<MovieCard movie={movie} />);

		expect(screen.getByText("Inception")).toBeInTheDocument();
		expect(screen.getByText("2010")).toBeInTheDocument();
		expect(screen.getByText("8.4")).toBeInTheDocument();
	});

	it("renders the poster with the title as alt text", () => {
		render(<MovieCard movie={movie} />);

		const poster = screen.getByRole("img", { name: "Inception" });
		expect(poster.getAttribute("src")).toContain(
			encodeURIComponent("https://image.tmdb.org/t/p/w500/inception.jpg"),
		);
	});

	it("cancels navigation when the bookmark button is clicked", () => {
		render(<MovieCard movie={movie} />);

		// fireEvent returns false once preventDefault ran, i.e. the surrounding
		// link will not follow through to the details page.
		expect(fireEvent.click(screen.getByRole("button"))).toBe(false);
		expect(fireEvent.click(screen.getByRole("link"))).toBe(true);
	});
});
