import { asc, desc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { authMacro } from "../authMacro";
import { db } from "../clients";
import { chats, messages } from "../db/chat-schema";
import chatService from "../services/chatService";

const chatRoutes = new Elysia({ name: "chat", prefix: "/chat" })
	.use(authMacro)
	.guard({
		auth: true,
		// biome-ignore lint/suspicious/noExplicitAny: Elysia macro typing requires cast for auth guard
	} as any)
	.post(
		"/",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ body, user, status }: any) => {
			try {
				const values: { userId: string; title?: string } = {
					userId: user.id,
				};
				if (body.title !== undefined) {
					values.title = body.title;
				}
				const [chat] = await db.insert(chats).values(values).returning();
				return chat;
			} catch (error) {
				console.error("[ChatRoutes] Error creating chat:", error);
				return status(500, "Failed to create chat");
			}
		},
		{
			body: t.Object({
				title: t.Optional(
					t.String({
						description: "Chat title",
						maxLength: 100,
						minLength: 1,
					}),
				),
			}),
		},
	)
	.post(
		"/create",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ body, user, status }: any) => {
			try {
				const values: { userId: string; title?: string } = {
					userId: user.id,
				};
				if (body.title !== undefined) {
					values.title = body.title;
				}
				const [chat] = await db.insert(chats).values(values).returning();
				return chat;
			} catch (error) {
				console.error("[ChatRoutes] Error creating chat:", error);
				return status(500, "Failed to create chat");
			}
		},
		{
			body: t.Object({
				title: t.Optional(
					t.String({
						description: "Chat title",
						maxLength: 100,
						minLength: 1,
					}),
				),
			}),
		},
	)
	.get(
		"/",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ query, user, status }: any) => {
			try {
				const limit = query.limit ?? 20;
				const offset = query.offset ?? 0;
				const userId = user.id;
				const result = await db
					.select()
					.from(chats)
					.where(eq(chats.userId, userId))
					.orderBy(desc(chats.updatedAt))
					.limit(limit)
					.offset(offset);
				return result;
			} catch (error) {
				console.error("[ChatRoutes] Error listing chats:", error);
				return status(500, "Failed to list chats");
			}
		},
		{
			query: t.Object({
				limit: t.Optional(
					t.Number({
						default: 20,
						description: "Number of chats to return",
						maximum: 100,
						minimum: 1,
					}),
				),
				offset: t.Optional(
					t.Number({
						default: 0,
						description: "Offset for pagination",
						minimum: 0,
					}),
				),
			}),
		},
	)
	.get(
		"/models",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ status }: any) => {
			try {
				return await chatService.listModels();
			} catch (error) {
				console.error("[ChatRoutes] Error listing chat models:", error);
				return status(500, "Failed to list chat models");
			}
		},
	)
	.get(
		"/:id",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ params, user, status }: any) => {
			try {
				const userId = user.id;
				const [chat] = await db
					.select()
					.from(chats)
					.where(eq(chats.id, params.id))
					.limit(1);

				if (!chat) {
					return status(404, "Chat not found");
				}

				if (chat.userId !== userId) {
					return status(404, "Chat not found");
				}

				const chatMessages = await db
					.select()
					.from(messages)
					.where(eq(messages.chatId, params.id))
					.orderBy(asc(messages.createdAt));

				return { ...chat, messages: chatMessages };
			} catch (error) {
				console.error("[ChatRoutes] Error fetching chat:", error);
				return status(500, "Failed to fetch chat");
			}
		},
		{
			params: t.Object({
				id: t.String({
					description: "Chat ID",
					minLength: 1,
				}),
			}),
		},
	)
	.delete(
		"/:id",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ params, user, status }: any) => {
			try {
				const userId = user.id;
				const [chat] = await db
					.select()
					.from(chats)
					.where(eq(chats.id, params.id))
					.limit(1);

				if (!chat) {
					return status(404, "Chat not found");
				}

				if (chat.userId !== userId) {
					return status(404, "Chat not found");
				}

				await db.delete(chats).where(eq(chats.id, params.id));

				return { success: true };
			} catch (error) {
				console.error("[ChatRoutes] Error deleting chat:", error);
				return status(500, "Failed to delete chat");
			}
		},
		{
			params: t.Object({
				id: t.String({
					description: "Chat ID",
					minLength: 1,
				}),
			}),
		},
	)
	.post(
		"/:id/messages",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ params, body, user, status }: any) => {
			try {
				const userId = user.id;
				const [chat] = await db
					.select()
					.from(chats)
					.where(eq(chats.id, params.id))
					.limit(1);

				if (!chat) {
					return status(404, "Chat not found");
				}

				if (chat.userId !== userId) {
					return status(404, "Chat not found");
				}

				const [message] = await db
					.insert(messages)
					.values({
						chatId: params.id,
						content: body.content,
						role: body.role,
					})
					.returning();

				await db
					.update(chats)
					.set({ updatedAt: new Date() })
					.where(eq(chats.id, params.id));

				return message;
			} catch (error) {
				console.error("[ChatRoutes] Error creating message:", error);
				return status(500, "Failed to create message");
			}
		},
		{
			body: t.Object({
				content: t.String({
					description: "Message content",
					maxLength: 10000,
					minLength: 1,
				}),
				role: t.Union(
					[t.Literal("user"), t.Literal("assistant"), t.Literal("system")],
					{
						description: "Message role",
					},
				),
			}),
			params: t.Object({
				id: t.String({
					description: "Chat ID",
					minLength: 1,
				}),
			}),
		},
	)
	.post(
		"/:id/stream",
		// biome-ignore lint/suspicious/noExplicitAny: Elysia context requires any for macro-injected user
		async ({ params, body, user, status }: any) => {
			try {
				const [chat] = await db
					.select()
					.from(chats)
					.where(eq(chats.id, params.id))
					.limit(1);

				if (!chat || chat.userId !== user.id) {
					return status(404, "Chat not found");
				}

				return await chatService.streamChat(
					params.id,
					body.messages,
					body.model,
				);
			} catch (error) {
				console.error("[ChatRoutes] Error streaming chat:", error);
				return status(500, "Failed to stream chat");
			}
		},
		{
			// UIMessage is the AI SDK's own wire format; validating its shape here
			// would duplicate the SDK's schema and drift from it.
			body: t.Object({
				messages: t.Array(t.Any(), {
					description: "The conversation so far, as AI SDK UI messages",
				}),
				model: t.Optional(
					t.String({
						description:
							"Which chat model to use, from GET /chat/models. Defaults to the server's configured model.",
						minLength: 1,
					}),
				),
			}),
			params: t.Object({
				id: t.String({
					description: "Chat ID",
					minLength: 1,
				}),
			}),
		},
	);

export default chatRoutes;
