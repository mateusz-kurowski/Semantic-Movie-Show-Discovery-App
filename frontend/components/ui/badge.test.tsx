import { describe, expect, it } from "vitest";
import { badgeVariants } from "./badge";

describe("badgeVariants", () => {
	// The redesign assigns one colour role per meaning: cyan for metadata,
	// amber for ratings, violet for AI. Mixing them up is a visual regression
	// no type check would catch.
	it("gives each semantic role its own token", () => {
		expect(badgeVariants({ variant: "chip" })).toContain("text-secondary");
		expect(badgeVariants({ variant: "rating" })).toContain("text-tertiary");
		expect(badgeVariants({ variant: "ai" })).toContain("text-primary");
	});

	it("keeps the shared badge shape on every variant", () => {
		for (const variant of ["chip", "rating", "ai", "default"] as const) {
			expect(badgeVariants({ variant })).toContain("rounded-4xl");
		}
	});
});
