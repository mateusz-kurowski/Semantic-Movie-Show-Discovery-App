import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AiMovieCard, { type MoviePick } from "./AiMovieCard";

const movie: MoviePick = {
	genres: ["Science Fiction", "Drama"],
	id: 157336,
	posterPath: "/interstellar.jpg",
	releaseDate: "2014-11-05",
	runtime: 169,
	title: "Interstellar",
	voteAverage: 8.417,
};

describe("AiMovieCard", () => {
	it("shows year, runtime and rating alongside the title", () => {
		render(
			<AiMovieCard
				movie={movie}
				isShortlisted={false}
				onToggleShortlist={vi.fn()}
			/>,
		);

		expect(screen.getByText("2014 · 2h 49m")).toBeInTheDocument();
		expect(screen.getByText("8.4")).toBeInTheDocument();
		expect(screen.getByText("Science Fiction")).toBeInTheDocument();
	});

	it("links the title and poster to the details page", () => {
		render(
			<AiMovieCard
				movie={movie}
				isShortlisted={false}
				onToggleShortlist={vi.fn()}
			/>,
		);

		for (const link of screen.getAllByRole("link")) {
			expect(link).toHaveAttribute("href", "/movies/157336");
		}
	});

	it("hands the film back when shortlisted", async () => {
		const onToggleShortlist = vi.fn();
		const user = userEvent.setup();
		render(
			<AiMovieCard
				movie={movie}
				isShortlisted={false}
				onToggleShortlist={onToggleShortlist}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Shortlist" }));

		expect(onToggleShortlist).toHaveBeenCalledWith(movie);
	});

	it("reflects a film that is already shortlisted", () => {
		render(
			<AiMovieCard movie={movie} isShortlisted onToggleShortlist={vi.fn()} />,
		);

		expect(
			screen.getByRole("button", { name: "Shortlisted" }),
		).toBeInTheDocument();
	});

	it("copes with a film missing a runtime, poster and rating", () => {
		render(
			<AiMovieCard
				movie={{
					...movie,
					posterPath: null,
					runtime: null,
					voteAverage: null,
				}}
				isShortlisted={false}
				onToggleShortlist={vi.fn()}
			/>,
		);

		expect(screen.getByText("2014")).toBeInTheDocument();
		expect(screen.queryByRole("img")).toBeNull();
	});
});
