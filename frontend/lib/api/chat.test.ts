import { beforeEach, describe, expect, it, vi } from "vitest";
import { chatService, chatStreamUrl } from "./chat";

const fetchMock = vi.fn();

const ok = (body: unknown) =>
	({ json: async () => body, ok: true, status: 200 }) as unknown as Response;

beforeEach(() => {
	fetchMock.mockReset();
	fetchMock.mockResolvedValue(ok({}));
	vi.stubGlobal("fetch", fetchMock);
});

describe("chatService", () => {
	it("creates a chat with the session cookie attached", async () => {
		fetchMock.mockResolvedValue(ok({ id: "chat_1", title: "New" }));

		const chat = await chatService.createChat();

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("http://api.test/chat");
		expect(init.method).toBe("POST");
		expect(init.credentials).toBe("include");
		expect(chat.id).toBe("chat_1");
	});

	it("passes a title through when one is given", async () => {
		await chatService.createChat("Hopeful sci-fi");

		expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
			title: "Hopeful sci-fi",
		});
	});

	it("lists and fetches chats by id", async () => {
		await chatService.listChats();
		expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/chat");

		await chatService.getChat("chat_1");
		expect(fetchMock.mock.calls[1][0]).toBe("http://api.test/chat/chat_1");
	});

	it("explains an unauthenticated request", async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 401 } as Response);

		await expect(chatService.listChats()).rejects.toThrow(
			"Sign in to use Ask AI.",
		);
	});
});

describe("chatStreamUrl", () => {
	it("points at the streaming endpoint for one chat", () => {
		expect(chatStreamUrl("chat_1")).toBe("http://api.test/chat/chat_1/stream");
	});
});
