import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { MoviePick } from "./AiMovieCard";
import ShortlistRail from "./ShortlistRail";

const movies: MoviePick[] = [
	{
		genres: ["Drama"],
		id: 354912,
		posterPath: "/coco.jpg",
		releaseDate: "2017-10-27",
		runtime: 105,
		title: "Coco",
		voteAverage: 8.2,
	},
];

const setup = (props: Partial<Parameters<typeof ShortlistRail>[0]> = {}) => {
	const handlers = {
		onClear: vi.fn(),
		onRemove: vi.fn(),
		onSaveAll: vi.fn(),
	};
	render(
		<ShortlistRail
			movies={movies}
			isSaving={false}
			saveError={null}
			{...handlers}
			{...props}
		/>,
	);
	return { ...handlers, user: userEvent.setup() };
};

describe("ShortlistRail", () => {
	it("explains itself while empty and offers nothing to save", () => {
		setup({ movies: [] });

		expect(
			screen.getByText(/stay here for the whole conversation/),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Save all to watchlist/ }),
		).toBeNull();
	});

	it("counts the shortlisted films", () => {
		setup();

		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("Coco")).toBeInTheDocument();
		expect(screen.getByText("2017 · 1h 45m")).toBeInTheDocument();
	});

	it("removes one film by id", async () => {
		const { onRemove, user } = setup();

		await user.click(
			screen.getByRole("button", { name: "Remove Coco from shortlist" }),
		);

		expect(onRemove).toHaveBeenCalledWith(354912);
	});

	it("clears and saves the whole shortlist", async () => {
		const { onClear, onSaveAll, user } = setup();

		await user.click(screen.getByRole("button", { name: "Clear" }));
		expect(onClear).toHaveBeenCalled();

		await user.click(
			screen.getByRole("button", { name: /Save all to watchlist/ }),
		);
		expect(onSaveAll).toHaveBeenCalled();
	});

	it("disables saving while it is in flight", () => {
		setup({ isSaving: true });

		expect(screen.getByRole("button", { name: /Saving/ })).toBeDisabled();
	});

	it("surfaces a failed save", () => {
		setup({ saveError: "Sign in to use your watchlist." });

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Sign in to use your watchlist.",
		);
	});
});
