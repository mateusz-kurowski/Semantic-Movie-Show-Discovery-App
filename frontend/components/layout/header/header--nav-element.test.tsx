import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HeaderNavElement from "./header--nav-element";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

const renderAt = (pathname: string, href: string) => {
	usePathname.mockReturnValue(pathname);
	render(<HeaderNavElement href={href}>Section</HeaderNavElement>);
	return screen.getByRole("link", { name: "Section" });
};

describe("HeaderNavElement", () => {
	it("underlines the section the user is inside", () => {
		expect(renderAt("/watchlist", "/watchlist")).toHaveClass("border-primary");
	});

	it("stays underlined on nested routes of that section", () => {
		expect(renderAt("/watchlist/123", "/watchlist")).toHaveClass(
			"border-primary",
		);
	});

	it("leaves other sections unmarked", () => {
		expect(renderAt("/history", "/watchlist")).toHaveClass(
			"border-transparent",
		);
	});

	it("matches home only exactly, so it does not light up everywhere", () => {
		// A prefix match on "/" would underline Home on every route.
		expect(renderAt("/watchlist", "/")).toHaveClass("border-transparent");
	});

	it("underlines home on the home page", () => {
		expect(renderAt("/", "/")).toHaveClass("border-primary");
	});
});
