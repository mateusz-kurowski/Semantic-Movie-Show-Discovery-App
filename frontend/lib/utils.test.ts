import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("lets the last conflicting tailwind utility win", () => {
		expect(cn("text-outline", "text-primary")).toBe("text-primary");
	});

	it("drops falsy values and keeps conditional classes", () => {
		expect(
			cn("border-b-2", false && "border-primary", "border-transparent"),
		).toBe("border-b-2 border-transparent");
	});
});
