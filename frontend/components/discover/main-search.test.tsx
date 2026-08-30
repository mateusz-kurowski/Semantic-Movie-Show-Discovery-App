import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchForm from "./main-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
}));

beforeEach(() => {
	push.mockReset();
});

describe("SearchForm", () => {
	it("navigates to the search route with the typed phrase", async () => {
		const user = userEvent.setup();
		render(<SearchForm />);

		await user.type(
			screen.getByRole("textbox"),
			"a hopeful sci-fi adventure{Enter}",
		);

		expect(push).toHaveBeenCalledWith("/search?q=a hopeful sci-fi adventure");
	});

	it("does not navigate on an empty query", async () => {
		const user = userEvent.setup();
		render(<SearchForm />);

		await user.type(screen.getByRole("textbox"), "{Enter}");

		expect(push).not.toHaveBeenCalled();
	});

	it("searches straight from a recommendation prompt", async () => {
		const user = userEvent.setup();
		render(<SearchForm showRecommendationBadges />);

		await user.click(
			screen.getByRole("button", { name: /Feel-good films under 2 hours/ }),
		);

		expect(push).toHaveBeenCalledWith(
			"/search?q=Feel-good films under 2 hours",
		);
	});

	it("prefills the input on the results page and drops the submit button", () => {
		render(
			<SearchForm
				defaultValue="noir"
				togglesVisible={false}
				btnVisible={false}
				icon={<Search />}
				compact
			/>,
		);

		expect(screen.getByRole("textbox")).toHaveValue("noir");
		expect(screen.queryAllByRole("button")).toHaveLength(0);
	});

	it("shows the search-mode toggles only when asked", () => {
		const { rerender } = render(<SearchForm togglesVisible={false} />);
		expect(screen.queryByRole("button", { name: "Ask AI" })).toBeNull();

		rerender(<SearchForm />);
		expect(screen.getByRole("button", { name: "Ask AI" })).toBeInTheDocument();
	});
});
