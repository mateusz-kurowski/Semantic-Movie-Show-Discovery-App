import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RecommendationBadges from "./recommendation-badges";

describe("RecommendationBadges", () => {
	it("hands the clicked prompt back as the search query", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(<RecommendationBadges onClick={onClick} />);

		await user.click(
			screen.getByRole("button", { name: /90s psychological thrillers/ }),
		);

		expect(onClick).toHaveBeenCalledWith("90s psychological thrillers");
	});

	it("offers every seeded prompt", () => {
		render(<RecommendationBadges />);

		expect(screen.getAllByRole("button")).toHaveLength(3);
	});

	it("stays inert without a handler", async () => {
		const user = userEvent.setup();
		render(<RecommendationBadges />);

		await user.click(screen.getAllByRole("button")[0]);
	});
});
