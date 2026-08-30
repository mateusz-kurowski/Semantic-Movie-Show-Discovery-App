import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";

const { push, signIn, signUp } = vi.hoisted(() => ({
	push: vi.fn(),
	signIn: { email: vi.fn() },
	signUp: { email: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth/auth-client", () => ({ authClient: { signIn, signUp } }));

beforeEach(() => {
	push.mockReset();
	signIn.email.mockReset().mockResolvedValue(undefined);
	signUp.email.mockReset().mockResolvedValue(undefined);
});

const fillCredentials = async (
	user: ReturnType<typeof userEvent.setup>,
	password = "hunter2",
) => {
	await user.type(screen.getByLabelText("Email"), "viewer@reelfind.test");
	await user.type(screen.getByLabelText("Password"), password);
};

describe("AuthForm (sign-in)", () => {
	it("signs the user in with the submitted credentials", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-in" />);

		await fillCredentials(user);
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		expect(signIn.email).toHaveBeenCalledWith(
			expect.objectContaining({
				email: "viewer@reelfind.test",
				password: "hunter2",
			}),
		);
		expect(signUp.email).not.toHaveBeenCalled();
	});

	it("returns to the home page once the session is created", async () => {
		const user = userEvent.setup();
		signIn.email.mockImplementation(async ({ fetchOptions }) => {
			fetchOptions.onSuccess();
		});
		render(<AuthForm mode="sign-in" />);

		await fillCredentials(user);
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		expect(push).toHaveBeenCalledWith("/");
	});

	it("surfaces a rejected sign-in from the server", async () => {
		const user = userEvent.setup();
		signIn.email.mockImplementation(async ({ fetchOptions }) => {
			fetchOptions.onError({ error: { message: "Invalid credentials" } });
		});
		render(<AuthForm mode="sign-in" />);

		await fillCredentials(user);
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Invalid credentials",
		);
	});

	it("lets the browser block a syntactically invalid email", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-in" />);

		const email = screen.getByLabelText("Email");
		await user.type(email, "not-an-email");
		await user.type(screen.getByLabelText("Password"), "hunter2");
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		// type="email" fails constraint validation, so the form never submits.
		expect((email as HTMLInputElement).checkValidity()).toBe(false);
		expect(signIn.email).not.toHaveBeenCalled();
	});

	it("rejects an address the schema does not accept", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-in" />);

		// Valid to the browser, invalid to zod - this is the case the form's own
		// validation has to catch.
		await user.type(screen.getByLabelText("Email"), "viewer@localhost");
		await user.type(screen.getByLabelText("Password"), "hunter2");
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		expect(
			await screen.findByText("Invalid email address."),
		).toBeInTheDocument();
		expect(signIn.email).not.toHaveBeenCalled();
	});

	it("rejects a password shorter than the schema allows", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-in" />);

		await fillCredentials(user, "abc");
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		expect(
			await screen.findByText("Password must be at least 6 characters."),
		).toBeInTheDocument();
		expect(signIn.email).not.toHaveBeenCalled();
	});

	it("reveals and re-hides the password", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-in" />);
		const password = screen.getByLabelText("Password");

		expect(password).toHaveAttribute("type", "password");
		await user.click(screen.getByRole("button", { name: "Show password" }));
		expect(password).toHaveAttribute("type", "text");
		await user.click(screen.getByRole("button", { name: "Hide password" }));
		expect(password).toHaveAttribute("type", "password");
	});

	it("does not show the sign-up password checklist", () => {
		render(<AuthForm mode="sign-in" />);

		expect(screen.queryByText("At least 6 characters")).toBeNull();
	});
});

describe("AuthForm (sign-up)", () => {
	it("registers the account using the email as the display name", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-up" />);

		await fillCredentials(user);
		await user.type(screen.getByLabelText("Confirm Password"), "hunter2");
		await user.click(screen.getByRole("button", { name: "Sign Up" }));

		expect(signUp.email).toHaveBeenCalledWith(
			expect.objectContaining({
				email: "viewer@reelfind.test",
				name: "viewer@reelfind.test",
				password: "hunter2",
			}),
		);
	});

	it("blocks a mismatched confirmation", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-up" />);

		await fillCredentials(user);
		await user.type(screen.getByLabelText("Confirm Password"), "hunter3");
		await user.click(screen.getByRole("button", { name: "Sign Up" }));

		expect(
			await screen.findByText("Passwords do not match."),
		).toBeInTheDocument();
		expect(signUp.email).not.toHaveBeenCalled();
	});

	it("ticks each password rule as the real schema is satisfied", async () => {
		const user = userEvent.setup();
		render(<AuthForm mode="sign-up" />);

		// The rules mirror the zod schema (min 6 / max 100) rather than the
		// mock copy in the design, so they must move with it.
		expect(screen.getByText("At least 6 characters")).toHaveClass(
			"text-outline",
		);

		await user.type(screen.getByLabelText("Password"), "hunter2");

		expect(screen.getByText("At least 6 characters")).toHaveClass(
			"text-on-surface-variant",
		);
	});
});
