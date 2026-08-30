import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Logo from "./logo";

describe("Logo", () => {
	it("renders the wordmark with Find highlighted", () => {
		render(<Logo />);

		expect(screen.getByText(/Reel/)).toHaveTextContent("ReelFind");
		expect(screen.getByText("Find")).toHaveClass("text-primary");
	});

	it("maps the size prop to a static tailwind class", () => {
		// Regression: this used to be `text-${size}`, which Tailwind's scanner
		// never emits, so every size silently rendered at the inherited size.
		const { container } = render(<Logo size="xl" />);

		expect(container.firstChild).toHaveClass("text-xl");
	});

	it("defaults to the largest size and keeps caller classes", () => {
		const { container } = render(<Logo className="tracking-tight" />);

		expect(container.firstChild).toHaveClass("text-4xl", "tracking-tight");
	});
});
