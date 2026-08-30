import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "./header";

const { signOut, useSession, usePathname } = vi.hoisted(() => ({
	signOut: vi.fn(),
	usePathname: vi.fn(() => "/"),
	useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname }));
vi.mock("@/lib/auth/auth-client", () => ({
	authClient: { signOut, useSession },
}));

const signedIn = {
	data: { user: { image: null, name: "Ada Lovelace" } },
	isPending: false,
};

beforeEach(() => {
	useSession.mockReturnValue({ data: null, isPending: false });
});

describe("Header", () => {
	it("offers both auth routes to a signed-out visitor", () => {
		render(<Header />);

		expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
			"href",
			"/sign-in",
		);
		expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
			"href",
			"/sign-up",
		);
	});

	it("swaps the auth links for a profile avatar once signed in", () => {
		useSession.mockReturnValue(signedIn);

		render(<Header />);

		expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
		expect(screen.getByText("AL")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "AL" })).toHaveAttribute(
			"href",
			"/profile",
		);
	});

	it("signs the user out from the header button", async () => {
		const user = userEvent.setup();
		useSession.mockReturnValue(signedIn);

		render(<Header />);
		await user.click(screen.getAllByRole("button")[0]);

		expect(signOut).toHaveBeenCalled();
	});

	it("always links the wordmark back home", () => {
		render(<Header />);

		expect(screen.getByRole("link", { name: "ReelFind" })).toHaveAttribute(
			"href",
			"/",
		);
	});
});
