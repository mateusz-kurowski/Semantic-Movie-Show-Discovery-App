import { render, screen } from "@testing-library/react";
import { Frown } from "lucide-react";
import { describe, expect, it } from "vitest";
import EmptyState from "./empty-state";

describe("EmptyState", () => {
	it("shows the title as a heading alongside the description", () => {
		render(
			<EmptyState
				icon={Frown}
				title="Couldn't run that search"
				description="Failed to fetch"
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Couldn't run that search" }),
		).toBeInTheDocument();
		expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
	});
});
