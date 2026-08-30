import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Movie } from "@/lib/api/movies";
import MovieBanner from "./MovieBanner";

const movie: Movie = {
	adult: false,
	backdrop_path: "/backdrop.jpg",
	budget: 160000000,
	genres: ["Science Fiction", "Adventure"],
	homepage: "",
	id: "27205",
	imdb_id: "tt1375666",
	is_present_in_search: true,
	original_language: "en",
	original_title: "Inception",
	overview: "A thief who steals corporate secrets.",
	popularity: 84.1234,
	poster_path: "/poster.jpg",
	release_date: "2010-07-16",
	revenue: 825532764,
	runtime: 148,
	status: "Released",
	tagline: "Your mind is the scene of the crime.",
	title: "Inception",
	vote_average: 8.367,
	vote_count: 34567,
};

describe("MovieBanner", () => {
	it("shows the headline metadata row", () => {
		render(<MovieBanner movie={movie} />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Inception" }),
		).toBeInTheDocument();
		expect(screen.getByText("8.4")).toBeInTheDocument();
		expect(screen.getByText("34,567 votes")).toBeInTheDocument();
		expect(screen.getByText("2010")).toBeInTheDocument();
		expect(screen.getByText("2h 28m")).toBeInTheDocument();
	});

	it("renders the tagline, genres and overview", () => {
		render(<MovieBanner movie={movie} />);

		expect(
			screen.getByText("Your mind is the scene of the crime."),
		).toBeInTheDocument();
		expect(screen.getByText("Science Fiction")).toBeInTheDocument();
		expect(screen.getByText("Adventure")).toBeInTheDocument();
		expect(
			screen.getByText("A thief who steals corporate secrets."),
		).toBeInTheDocument();
	});

	it("fills the facts panel from fields the API already returns", () => {
		render(<MovieBanner movie={movie} />);

		expect(screen.getByText("Released")).toBeInTheDocument();
		expect(screen.getByText("EN")).toBeInTheDocument();
		expect(screen.getByText("$160,000,000")).toBeInTheDocument();
		expect(screen.getByText("$825,532,764")).toBeInTheDocument();
		expect(screen.getByText("84.12")).toBeInTheDocument();
	});

	it("dashes out money the dataset does not have", () => {
		render(<MovieBanner movie={{ ...movie, budget: 0, revenue: 0 }} />);

		expect(screen.getAllByText("—")).toHaveLength(2);
	});

	it("links out to IMDb when the id is known", () => {
		render(<MovieBanner movie={movie} />);

		expect(screen.getByRole("link", { name: /View on IMDb/ })).toHaveAttribute(
			"href",
			"https://www.imdb.com/title/tt1375666",
		);
	});

	it("drops the IMDb link and tagline when they are missing", () => {
		render(<MovieBanner movie={{ ...movie, imdb_id: "", tagline: "" }} />);

		expect(screen.queryByRole("link", { name: /View on IMDb/ })).toBeNull();
		expect(
			screen.queryByText("Your mind is the scene of the crime."),
		).toBeNull();
	});

	it("uses the original backdrop and the w500 poster", () => {
		render(<MovieBanner movie={movie} />);

		expect(
			screen.getByRole("img", { name: "Inception" }).getAttribute("src"),
		).toContain(
			encodeURIComponent("https://image.tmdb.org/t/p/original/backdrop.jpg"),
		);
		expect(
			screen.getByRole("img", { name: "Inception poster" }).getAttribute("src"),
		).toContain(
			encodeURIComponent("https://image.tmdb.org/t/p/w500/poster.jpg"),
		);
	});
});
