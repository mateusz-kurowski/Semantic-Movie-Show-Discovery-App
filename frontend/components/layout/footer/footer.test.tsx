import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { version } from "@/package.json";
import Footer from "./footer";

describe("Footer", () => {
	it("shows the app version release-please stamped into package.json", () => {
		render(<Footer />);

		expect(screen.getByText(`v${version}`)).toBeInTheDocument();
	});

	it("renders the version as a semver triple", () => {
		render(<Footer />);

		expect(screen.getByText(/^v\d+\.\d+\.\d+$/)).toBeInTheDocument();
	});

	it("keeps the legal links", () => {
		render(<Footer />);

		expect(
			screen.getByRole("link", { name: "Privacy Policy" }),
		).toHaveAttribute("href", "/privacy-policy");
		expect(screen.getAllByRole("link")).toHaveLength(3);
	});
});
