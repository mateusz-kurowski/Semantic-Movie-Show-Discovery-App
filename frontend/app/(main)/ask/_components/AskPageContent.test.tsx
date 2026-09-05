import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { chatService } from "@/lib/api/chat";
import { watchlistService } from "@/lib/api/watchlist";
import { renderWithQuery } from "@/test/render";
import AskPageContent from "./AskPageContent";

const { useChat, useSession, sendMessage, setMessages, stop } = vi.hoisted(
	() => ({
		sendMessage: vi.fn(),
		setMessages: vi.fn(),
		stop: vi.fn(),
		useChat: vi.fn(),
		useSession: vi.fn(),
	}),
);

vi.mock("@ai-sdk/react", () => ({ useChat }));
const searchParams = new URLSearchParams();
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
	usePathname: () => "/ask",
	useRouter: () => ({ replace: replaceMock }),
	useSearchParams: () => searchParams,
}));
vi.mock("@/lib/auth/auth-client", () => ({ authClient: { useSession } }));
vi.mock("@/lib/api/chat", () => ({
	chatService: {
		createChat: vi.fn(),
		deleteChat: vi.fn(),
		getChat: vi.fn(),
		listChats: vi.fn(),
		listModels: vi.fn(),
	},
	chatStreamUrl: (id: string) => `http://api.test/chat/${id}/stream`,
}));
vi.mock("@/lib/api/watchlist", () => ({
	watchlistService: {
		addToWatchlist: vi.fn(),
		getWatchlist: vi.fn(),
		removeFromWatchlist: vi.fn(),
	},
}));

const moviePart = {
	output: {
		movies: [
			{
				genres: ["Drama"],
				id: 354912,
				posterPath: "/coco.jpg",
				releaseDate: "2017-10-27",
				runtime: 105,
				title: "Coco",
				voteAverage: 8.2,
			},
		],
		phrase: "hopeful family films",
	},
	state: "output-available",
	toolCallId: "call_1",
	type: "tool-searchMovies",
};

const chatWith = (messages: unknown[], status = "ready") =>
	useChat.mockReturnValue({
		error: undefined,
		messages,
		sendMessage,
		setMessages,
		status,
		stop,
	});

beforeEach(() => {
	searchParams.delete("chat");
	searchParams.delete("q");
	useSession.mockReturnValue({
		data: { user: { id: "u1" } },
		isPending: false,
	});
	vi.mocked(watchlistService.addToWatchlist).mockResolvedValue(undefined);
	vi.mocked(chatService.listChats).mockResolvedValue([
		{ createdAt: "", id: "c1", title: "Old chat", updatedAt: "" },
	]);
	vi.mocked(chatService.listModels).mockResolvedValue([]);
	chatWith([]);
});

describe("AskPageContent", () => {
	it("asks signed-out visitors to sign in instead of opening a chat", () => {
		useSession.mockReturnValue({ data: null, isPending: false });

		renderWithQuery(<AskPageContent />);

		expect(
			screen.getByRole("heading", { name: "Sign in to use Ask AI" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
			"href",
			"/sign-in",
		);
		expect(screen.queryByLabelText("Message ReelFind AI")).toBeNull();
	});

	it("offers opening prompts on an empty conversation", async () => {
		const user = userEvent.setup();
		renderWithQuery(<AskPageContent />);

		await user.click(
			screen.getByRole("button", {
				name: "Something like Interstellar, but not so bleak",
			}),
		);

		expect(sendMessage).toHaveBeenCalledWith({
			text: "Something like Interstellar, but not so bleak",
		});
	});

	it("renders the conversation and the films the tool found", () => {
		chatWith([
			{
				id: "m1",
				parts: [{ text: "Something hopeful", type: "text" }],
				role: "user",
			},
			{
				id: "m2",
				parts: [
					{ text: "These three keep the warmth.", type: "text" },
					moviePart,
				],
				role: "assistant",
			},
		]);

		renderWithQuery(<AskPageContent />);

		expect(screen.getByText("Something hopeful")).toBeInTheDocument();
		expect(
			screen.getByText("These three keep the warmth."),
		).toBeInTheDocument();
		expect(screen.getByText("Coco")).toBeInTheDocument();
	});

	it("says it is searching while the tool call is still running", () => {
		chatWith([
			{
				id: "m2",
				parts: [{ ...moviePart, output: undefined, state: "input-available" }],
				role: "assistant",
			},
		]);

		renderWithQuery(<AskPageContent />);

		expect(screen.getByText("Searching the catalogue…")).toBeInTheDocument();
	});

	it("moves a film into the shortlist and saves the lot to the watchlist", async () => {
		const user = userEvent.setup();
		chatWith([{ id: "m2", parts: [moviePart], role: "assistant" }]);

		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: "Shortlist" }));
		await user.click(
			screen.getByRole("button", { name: /Save all to watchlist/ }),
		);

		await waitFor(() =>
			expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(354912),
		);
	});

	it("offers follow-up prompts once an answer has landed", async () => {
		const user = userEvent.setup();
		chatWith([
			{
				id: "m2",
				parts: [{ text: "Here you go.", type: "text" }],
				role: "assistant",
			},
		]);

		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: "Under 2 hours" }));

		expect(sendMessage).toHaveBeenCalledWith({ text: "Under 2 hours" });
	});

	it("hides the follow-up prompts while the answer is streaming", () => {
		chatWith(
			[{ id: "m2", parts: [{ text: "…", type: "text" }], role: "assistant" }],
			"streaming",
		);

		renderWithQuery(<AskPageContent />);

		expect(screen.getByText("Thinking…")).toBeInTheDocument();
		expect(screen.queryByText("NARROW IT")).toBeNull();
	});

	it("clears the board when a new chat is started", async () => {
		const user = userEvent.setup();
		chatWith([{ id: "m2", parts: [moviePart], role: "assistant" }]);

		renderWithQuery(<AskPageContent />);
		await user.click(screen.getByRole("button", { name: "Shortlist" }));
		await user.click(screen.getByRole("button", { name: /New/ }));

		expect(setMessages).toHaveBeenCalledWith([]);
		expect(
			screen.queryByRole("button", { name: /Save all to watchlist/ }),
		).toBeNull();
	});

	it("prefills the composer with a query carried over from search", () => {
		searchParams.set("q", "hopeful sci-fi");

		renderWithQuery(<AskPageContent />);

		expect(screen.getByLabelText("Message ReelFind AI")).toHaveValue(
			"hopeful sci-fi",
		);
	});

	it("opens a past chat and loads its messages", async () => {
		const user = userEvent.setup();
		vi.mocked(chatService.getChat).mockResolvedValue({
			createdAt: "",
			id: "c1",
			messages: [
				{
					chatId: "c1",
					content: "Something hopeful",
					createdAt: "",
					id: "m1",
					movies: [],
					role: "user",
				},
				{
					chatId: "c1",
					content: "Here you go.",
					createdAt: "",
					id: "m2",
					movies: [],
					role: "assistant",
				},
			],
			title: "Old chat",
			updatedAt: "",
		});
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(await screen.findByRole("button", { name: "Old chat" }));

		await waitFor(() =>
			expect(setMessages).toHaveBeenCalledWith([
				{
					id: "m1",
					parts: [{ text: "Something hopeful", type: "text" }],
					role: "user",
				},
				{
					id: "m2",
					parts: [{ text: "Here you go.", type: "text" }],
					role: "assistant",
				},
			]),
		);
		expect(chatService.getChat).toHaveBeenCalledWith("c1", expect.anything());
	});

	it("restores persisted movie cards when opening a past chat", async () => {
		const user = userEvent.setup();
		const movies = [
			{
				genres: ["Drama"],
				id: 354912,
				posterPath: "/coco.jpg",
				releaseDate: "2017-10-27",
				runtime: 105,
				title: "Coco",
				voteAverage: 8.2,
			},
		];
		vi.mocked(chatService.getChat).mockResolvedValue({
			createdAt: "",
			id: "c1",
			messages: [
				{
					chatId: "c1",
					content: "Something hopeful",
					createdAt: "",
					id: "m1",
					movies: [],
					role: "user",
				},
				{
					chatId: "c1",
					content: "Here you go.",
					createdAt: "",
					id: "m2",
					movies,
					role: "assistant",
				},
			],
			title: "Old chat",
			updatedAt: "",
		});
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(await screen.findByRole("button", { name: "Old chat" }));

		await waitFor(() =>
			expect(setMessages).toHaveBeenCalledWith([
				{
					id: "m1",
					parts: [{ text: "Something hopeful", type: "text" }],
					role: "user",
				},
				{
					id: "m2",
					parts: [
						{ text: "Here you go.", type: "text" },
						{
							input: { phrase: "" },
							output: { movies, phrase: "" },
							state: "output-available",
							toolCallId: "restored-m2",
							type: "tool-searchMovies",
						},
					],
					role: "assistant",
				},
			]),
		);
	});

	it("disables past chats while one is loading", async () => {
		const user = userEvent.setup();
		const { promise, resolve } =
			Promise.withResolvers<Awaited<ReturnType<typeof chatService.getChat>>>();
		vi.mocked(chatService.getChat).mockReturnValue(promise);
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		const chatButton = await screen.findByRole("button", { name: "Old chat" });
		await user.click(chatButton);

		expect(chatButton).toBeDisabled();
		resolve({
			createdAt: "",
			id: "c1",
			messages: [],
			title: "Old chat",
			updatedAt: "",
		});
	});

	it("surfaces a failed load instead of leaving the click silent", async () => {
		const user = userEvent.setup();
		vi.mocked(chatService.getChat).mockRejectedValue(
			new Error("Sign in to use Ask AI."),
		);
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(await screen.findByRole("button", { name: "Old chat" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Sign in to use Ask AI.",
		);
	});

	it("deletes a past chat from the history list", async () => {
		const user = userEvent.setup();
		vi.mocked(chatService.deleteChat).mockResolvedValue(undefined);
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(
			await screen.findByRole("button", { name: "Delete Old chat" }),
		);

		await waitFor(() =>
			expect(chatService.deleteChat).toHaveBeenCalledWith(
				"c1",
				expect.anything(),
			),
		);
	});

	it("resets to a fresh chat when the open chat is deleted", async () => {
		const user = userEvent.setup();
		vi.mocked(chatService.getChat).mockResolvedValue({
			createdAt: "",
			id: "c1",
			messages: [
				{
					chatId: "c1",
					content: "Something hopeful",
					createdAt: "",
					id: "m1",
					movies: [],
					role: "user",
				},
			],
			title: "Old chat",
			updatedAt: "",
		});
		vi.mocked(chatService.deleteChat).mockResolvedValue(undefined);
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(await screen.findByRole("button", { name: "Old chat" }));
		await waitFor(() => expect(chatService.getChat).toHaveBeenCalled());

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(
			await screen.findByRole("button", { name: "Delete Old chat" }),
		);

		await waitFor(() =>
			expect(chatService.deleteChat).toHaveBeenCalledWith(
				"c1",
				expect.anything(),
			),
		);
		await waitFor(() => expect(setMessages).toHaveBeenCalledWith([]));
	});

	it("surfaces a failed delete instead of leaving the click silent", async () => {
		const user = userEvent.setup();
		vi.mocked(chatService.deleteChat).mockRejectedValue(
			new Error("Chat not found."),
		);
		renderWithQuery(<AskPageContent />);

		await user.click(screen.getByRole("button", { name: /Past chats/ }));
		await user.click(
			await screen.findByRole("button", { name: "Delete Old chat" }),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Chat not found.",
		);
	});

	it("restores the chat from the ?chat param on mount", async () => {
		searchParams.set("chat", "c1");
		vi.mocked(chatService.getChat).mockResolvedValue({
			createdAt: "",
			id: "c1",
			messages: [
				{
					chatId: "c1",
					content: "Something hopeful",
					createdAt: "",
					id: "m1",
					movies: [],
					role: "user",
				},
			],
			title: "Old chat",
			updatedAt: "",
		});

		renderWithQuery(<AskPageContent />);

		await waitFor(() =>
			expect(chatService.getChat).toHaveBeenCalledWith("c1", expect.anything()),
		);
		await waitFor(() =>
			expect(setMessages).toHaveBeenCalledWith([
				{
					id: "m1",
					parts: [{ text: "Something hopeful", type: "text" }],
					role: "user",
				},
			]),
		);
	});

	it("never creates a chat when restoring from ?chat", async () => {
		searchParams.set("chat", "c1");
		vi.mocked(chatService.getChat).mockResolvedValue({
			createdAt: "",
			id: "c1",
			messages: [],
			title: "Old chat",
			updatedAt: "",
		});

		renderWithQuery(<AskPageContent />);

		await waitFor(() => expect(chatService.getChat).toHaveBeenCalled());
		expect(chatService.createChat).not.toHaveBeenCalled();
	});

	it("drops an unknown ?chat param and surfaces the error", async () => {
		searchParams.set("chat", "missing");
		vi.mocked(chatService.getChat).mockRejectedValue(
			new Error("Chat not found."),
		);

		renderWithQuery(<AskPageContent />);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Chat not found.",
		);
		await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/ask"));
	});

	it("does not fetch chat models for a signed-out visitor", () => {
		useSession.mockReturnValue({ data: null, isPending: false });

		renderWithQuery(<AskPageContent />);

		expect(chatService.listModels).not.toHaveBeenCalled();
	});

	it("offers a model picker once models have loaded", async () => {
		vi.mocked(chatService.listModels).mockResolvedValue([
			"GPT-5.6-Luna",
			"claude-opus-5",
		]);

		renderWithQuery(<AskPageContent />);

		expect(await screen.findByLabelText("Chat model")).toBeInTheDocument();
	});

	it("lets the user switch models mid-conversation", async () => {
		const user = userEvent.setup();
		vi.mocked(chatService.listModels).mockResolvedValue([
			"GPT-5.6-Luna",
			"claude-opus-5",
		]);

		renderWithQuery(<AskPageContent />);

		const trigger = await screen.findByLabelText("Chat model");
		await user.click(trigger);
		await user.click(
			await screen.findByRole("option", { name: "claude-opus-5" }),
		);

		expect(trigger).toHaveTextContent("claude-opus-5");
	});
});
