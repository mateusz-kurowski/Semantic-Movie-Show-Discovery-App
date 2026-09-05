import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChatComposer from "./ChatComposer";

const setup = ({
	defaultValue,
	isStreaming = false,
	model,
	models = [],
}: {
	defaultValue?: string;
	isStreaming?: boolean;
	model?: string;
	models?: string[];
} = {}) => {
	const onModelChange = vi.fn();
	const onSend = vi.fn();
	const onStop = vi.fn();
	render(
		<ChatComposer
			defaultValue={defaultValue}
			isStreaming={isStreaming}
			model={model}
			models={models}
			onModelChange={onModelChange}
			onSend={onSend}
			onStop={onStop}
		/>,
	);
	return { onModelChange, onSend, onStop, user: userEvent.setup() };
};

describe("ChatComposer", () => {
	it("sends the trimmed message on Enter and clears the box", async () => {
		const { onSend, user } = setup();

		const box = screen.getByLabelText("Message ReelFind AI");
		await user.type(box, "  something hopeful  {Enter}");

		expect(onSend).toHaveBeenCalledWith("something hopeful");
		expect(box).toHaveValue("");
	});

	it("keeps Shift+Enter for a newline", async () => {
		const { onSend, user } = setup();

		const box = screen.getByLabelText("Message ReelFind AI");
		await user.type(box, "first{Shift>}{Enter}{/Shift}second");

		expect(onSend).not.toHaveBeenCalled();
		expect(box).toHaveValue("first\nsecond");
	});

	it("refuses to send an empty message", async () => {
		const { onSend, user } = setup();

		await user.type(screen.getByLabelText("Message ReelFind AI"), "   {Enter}");

		expect(onSend).not.toHaveBeenCalled();
	});

	it("offers stop instead of send while the answer streams", async () => {
		const { onSend, onStop, user } = setup({ isStreaming: true });

		expect(screen.queryByRole("button", { name: "Send" })).toBeNull();
		await user.click(screen.getByRole("button", { name: "Stop generating" }));

		expect(onStop).toHaveBeenCalled();
		expect(onSend).not.toHaveBeenCalled();
	});

	it("prefills from a value carried over from search", () => {
		setup({ defaultValue: "hopeful sci-fi" });

		expect(screen.getByLabelText("Message ReelFind AI")).toHaveValue(
			"hopeful sci-fi",
		);
	});

	it("still lets an empty seed value show the placeholder", () => {
		setup();

		expect(screen.getByLabelText("Message ReelFind AI")).toHaveValue("");
	});

	it("hides the model picker when no models were loaded", () => {
		setup({ models: [] });

		expect(screen.queryByLabelText("Chat model")).toBeNull();
	});

	it("offers every loaded model and reports the pick", async () => {
		const { onModelChange, user } = setup({
			models: ["GPT-5.6-Luna", "claude-opus-5"],
		});

		await user.click(screen.getByLabelText("Chat model"));
		await user.click(
			await screen.findByRole("option", { name: "claude-opus-5" }),
		);

		expect(onModelChange).toHaveBeenCalledWith("claude-opus-5");
	});

	it("shows the picked model as the trigger's value", () => {
		setup({
			model: "claude-opus-5",
			models: ["GPT-5.6-Luna", "claude-opus-5"],
		});

		expect(screen.getByLabelText("Chat model")).toHaveTextContent(
			"claude-opus-5",
		);
	});

	it("shows a placeholder until a model is explicitly picked", () => {
		setup({ models: ["GPT-5.6-Luna"] });

		expect(screen.getByLabelText("Chat model")).toHaveTextContent(
			"Default model",
		);
	});

	it("keeps the model picker controlled across the undefined-to-picked switch", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const props = {
			isStreaming: false,
			models: ["GPT-5.6-Luna", "claude-opus-5"],
			onModelChange: vi.fn(),
			onSend: vi.fn(),
			onStop: vi.fn(),
		};
		const { rerender } = render(<ChatComposer model={undefined} {...props} />);

		expect(screen.getByLabelText("Chat model")).toHaveTextContent(
			"Default model",
		);

		// Simulate the parent storing the picked model, as AskPageContent does.
		rerender(<ChatComposer model="claude-opus-5" {...props} />);

		expect(screen.getByLabelText("Chat model")).toHaveTextContent(
			"claude-opus-5",
		);
		const switched = [...errorSpy.mock.calls, ...warnSpy.mock.calls].some(
			(args) =>
				args.some(
					(arg) =>
						typeof arg === "string" &&
						arg.includes("uncontrolled") &&
						arg.includes("controlled"),
				),
		);
		expect(switched).toBe(false);
		errorSpy.mockRestore();
		warnSpy.mockRestore();
	});
});
