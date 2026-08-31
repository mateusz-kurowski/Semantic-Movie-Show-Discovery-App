import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchModeContainer from "./search-mode-container";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
	push.mockReset();
});

describe("SearchModeContainer", () => {
	it("carries the typed query over when switching to Ask AI", async () => {
		const user = userEvent.setup();
		render(<SearchModeContainer query="hopeful sci-fi" />);

		await user.click(screen.getByRole("button", { name: "Ask AI" }));

		expect(push).toHaveBeenCalledWith("/ask?q=hopeful%20sci-fi");
	});

	it("goes to a bare /ask when the search box is empty", async () => {
		const user = userEvent.setup();
		render(<SearchModeContainer query="   " />);

		await user.click(screen.getByRole("button", { name: "Ask AI" }));

		expect(push).toHaveBeenCalledWith("/ask");
	});

	it("does not navigate when switching back to Search", async () => {
		const user = userEvent.setup();
		render(<SearchModeContainer query="hopeful sci-fi" />);

		await user.click(screen.getByRole("button", { name: "Search" }));

		expect(push).not.toHaveBeenCalled();
	});
});
