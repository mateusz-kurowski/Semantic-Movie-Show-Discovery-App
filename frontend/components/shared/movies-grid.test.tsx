import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Movie } from "@/lib/api/movies";
import MoviesGrid from "./movies-grid";

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
		render(<MoviesGrid movies={movies} />);

		expect(screen.getAllByRole("link")).toHaveLength(2);
		expect(screen.getByText("Arrival")).toBeInTheDocument();
		expect(screen.getByText("Interstellar")).toBeInTheDocument();
	});

	it("renders nothing for an empty result set", () => {
		render(<MoviesGrid movies={[]} />);

		expect(screen.queryAllByRole("link")).toHaveLength(0);
	});
});
