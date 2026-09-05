"use client";
import { useChat } from "@ai-sdk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { History, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { chatService, chatStreamUrl } from "@/lib/api/chat";
import { watchlistService } from "@/lib/api/watchlist";
import { authClient } from "@/lib/auth/auth-client";
import AiMovieCard, { type MoviePick } from "./AiMovieCard";
import ChatComposer from "./ChatComposer";
import ShortlistRail from "./ShortlistRail";

const NARROW_IT = [
	"Even more hopeful",
	"Less sci-fi",
	"Watch with family",
	"Only 2010s",
	"Under 2 hours",
];

const OPENERS = [
	"Something like Interstellar, but not so bleak",
	"A 90s thriller I can watch with my parents",
	"That film where a man relives the same day",
];

interface SearchMoviesOutput {
	movies: MoviePick[];
	phrase: string;
}

const textOf = (message: UIMessage) =>
	message.parts
		.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join("")
		.trim();

const titleFrom = (messages: UIMessage[]) => {
	const opener = messages.find((message) => message.role === "user");
	const title = opener ? textOf(opener).slice(0, 100) : "";
	return title || undefined;
};

const partKey = (message: UIMessage, part: unknown, index: number) =>
	part && typeof part === "object" && "toolCallId" in part
		? String((part as { toolCallId: string }).toolCallId)
		: `${message.id}-${index}`;

const splitSuggestion = (
	text: string,
): { body: string; suggestion?: string } => {
	const lines = text.trimEnd().split("\n");
	const lastLine = lines[lines.length - 1] ?? "";
	const match = lastLine.match(/^Try:\s*(.+)$/);
	if (!match?.[1]) {
		return { body: text };
	}
	const suggestion = match[1].trim();
	if (!suggestion) {
		return { body: text };
	}
	const body = lines.slice(0, -1).join("\n").trimEnd();
	return { body, suggestion };
};

const AskPageContent = () => {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	// Carries over what the user already typed in the search bar when they flip
	// the mode toggle to Ask AI, so they don't retype it.
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const seedQuery = searchParams.get("q")?.trim() || undefined;
	const queryClient = useQueryClient();

	const chatIdRef = useRef<string | null>(null);
	// Remembers which ?chat id the mount-restore already attempted, so
	// StrictMode double-effects can't double-fetch it.
	const restoreAttemptedRef = useRef<string | null>(null);

	// Mirrors the active chat id into ?chat (preserving the rest of the query
	// string, e.g. ?q) via replace, so refreshes restore the conversation
	// without spamming history. No-ops when the URL already matches.
	const syncChatParam = useCallback(
		(chatId: string | null) => {
			const next = new URLSearchParams(searchParams.toString());
			if (chatId) {
				if (next.get("chat") === chatId) return;
				next.set("chat", chatId);
			} else {
				if (!next.has("chat")) return;
				next.delete("chat");
			}
			const query = next.toString();
			router.replace(query ? `${pathname}?${query}` : pathname);
		},
		[pathname, router, searchParams],
	);
	const [shortlist, setShortlist] = useState<MoviePick[]>([]);
	const [isHistoryOpen, setHistoryOpen] = useState(false);
	// undefined = let the server pick its configured default model.
	const [model, setModel] = useState<string | undefined>(undefined);

	const chatModels = useQuery({
		enabled: !!session?.user,
		queryFn: chatService.listModels,
		queryKey: ["chat-models"],
	});

	const ensureChatId = useCallback(
		async (title?: string) => {
			// The chat row is only created on the first send, so opening the page and
			// leaving does not litter the database with empty conversations.
			if (chatIdRef.current) return chatIdRef.current;
			const chat = await chatService.createChat(title);
			chatIdRef.current = chat.id;
			syncChatParam(chat.id);
			return chat.id;
		},
		[syncChatParam],
	);

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				credentials: "include",
				prepareSendMessagesRequest: async ({ messages }) => ({
					// The opening question doubles as the title, so "Past chats" is
					// readable instead of a wall of default titles.
					api: chatStreamUrl(await ensureChatId(titleFrom(messages))),
					body: { messages, model },
				}),
			}),
		[ensureChatId, model],
	);

	const { messages, sendMessage, status, error, stop, setMessages } = useChat({
		transport,
	});

	const isStreaming = status === "streaming" || status === "submitted";

	const pastChats = useQuery({
		enabled: isHistoryOpen,
		queryFn: chatService.listChats,
		queryKey: ["chats"],
	});

	const saveAll = useMutation({
		mutationFn: async (movies: MoviePick[]) => {
			for (const movie of movies) {
				await watchlistService.addToWatchlist(movie.id);
			}
		},
		onSuccess: () => {
			setShortlist([]);
			queryClient.invalidateQueries({ queryKey: ["watchlist"] });
		},
	});

	const startNewChat = () => {
		chatIdRef.current = null;
		setMessages([]);
		setShortlist([]);
		setHistoryOpen(false);
		syncChatParam(null);
	};

	const openChat = useMutation({
		mutationFn: chatService.getChat,
		onSuccess: (chat) => {
			chatIdRef.current = chat.id;
			syncChatParam(chat.id);
			setMessages(
				chat.messages
					.filter((message) => message.role !== "system")
					.map((message) => {
						const parts: UIMessage["parts"] = [
							{ text: message.content, type: "text" as const },
						];
						if (
							message.role === "assistant" &&
							Array.isArray(message.movies) &&
							message.movies.length > 0
						) {
							parts.push({
								input: { phrase: "" },
								output: { movies: message.movies, phrase: "" },
								state: "output-available" as const,
								toolCallId: `restored-${message.id}`,
								type: "tool-searchMovies" as const,
							});
						}
						return {
							id: message.id,
							parts,
							role: message.role as "user" | "assistant",
						};
					}),
			);
			setShortlist([]);
			setHistoryOpen(false);
		},
		onError: (_error, failedId) => {
			// A bookmarked or refreshed ?chat id that no longer exists falls
			// back to a fresh chat; the error itself surfaces via the alert.
			// History clicks don't touch the param, so only clear it for the
			// mount-restore attempt.
			if (restoreAttemptedRef.current === failedId) {
				syncChatParam(null);
			}
		},
	});

	const deleteChat = useMutation({
		mutationFn: chatService.deleteChat,
		onSuccess: (_data, deletedId) => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
			if (chatIdRef.current === deletedId) {
				startNewChat();
			}
		},
	});

	// Restores a bookmarked or refreshed ?chat=<id> on mount through the same
	// path as opening from history (movie cards included). Guarded so
	// StrictMode double-effects and param cleanups can't double-fetch or loop:
	// one attempt per id, and never while a chat is already loaded.
	useEffect(() => {
		if (!session?.user) return;
		const chatParam = searchParams.get("chat")?.trim();
		if (!chatParam) return;
		if (chatIdRef.current) return;
		if (restoreAttemptedRef.current === chatParam) return;
		restoreAttemptedRef.current = chatParam;
		openChat.mutate(chatParam);
	}, [openChat.mutate, searchParams, session?.user]);

	const toggleShortlist = (movie: MoviePick) =>
		setShortlist((current) =>
			current.some((item) => item.id === movie.id)
				? current.filter((item) => item.id !== movie.id)
				: [...current, movie],
		);

	if (isSessionPending) {
		return (
			<main className="flex flex-1 flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
				<Skeleton className="h-8 w-48 rounded-full" />
				<Skeleton className="h-40 w-full rounded-2xl" />
			</main>
		);
	}

	if (!session?.user) {
		return (
			<main className="flex flex-1 flex-col">
				<EmptyState
					icon={Sparkles}
					title="Sign in to use Ask AI"
					description="Conversations are saved to your account on your own server, so Ask AI needs you signed in."
				/>
				<div className="flex justify-center pb-16">
					<Link
						href="/sign-in"
						className={buttonVariants({
							className: "h-11 rounded-full px-6 font-semibold",
						})}
					>
						Sign In
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col lg:flex-row">
			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center justify-between gap-3 border-border border-b px-4 py-3 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2.5">
						<span className="flex size-6.5 items-center justify-center rounded-lg bg-primary/14 text-primary">
							<Sparkles className="size-3.5" />
						</span>
						<h1 className="text-[15px] font-semibold">Ask AI</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							className="h-8.5 cursor-pointer rounded-full text-[13px]"
							onClick={() => setHistoryOpen((open) => !open)}
						>
							<History /> Past chats
						</Button>
						<Button
							variant="ghost"
							className="h-8.5 cursor-pointer rounded-full bg-foreground/8 text-[13px] font-semibold"
							onClick={startNewChat}
						>
							<Plus /> New
						</Button>
					</div>
				</div>

				{isHistoryOpen && (
					<div className="flex flex-col gap-1 border-border border-b px-4 py-3 sm:px-6 lg:px-8">
						{pastChats.isPending && (
							<Skeleton className="h-9 w-full rounded-lg" />
						)}
						{pastChats.isError && (
							<p className="text-sm text-destructive">
								{pastChats.error.message}
							</p>
						)}
						{pastChats.data?.length === 0 && (
							<p className="text-sm text-outline">No past conversations yet.</p>
						)}
						{pastChats.data?.map((chat) => {
							const isDeleting =
								deleteChat.isPending && deleteChat.variables === chat.id;
							return (
								<div key={chat.id} className="flex items-center gap-1">
									<Button
										variant="ghost"
										disabled={openChat.isPending}
										className="h-9 flex-1 cursor-pointer justify-start rounded-lg text-sm font-normal text-on-surface-variant hover:text-on-surface"
										onClick={() => openChat.mutate(chat.id)}
									>
										{openChat.isPending && openChat.variables === chat.id ? (
											<Loader2 className="size-3.5 animate-spin" />
										) : null}
										{chat.title}
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Delete ${chat.title}`}
										disabled={isDeleting}
										className="cursor-pointer text-outline hover:text-destructive"
										onClick={(event) => {
											event.stopPropagation();
											deleteChat.mutate(chat.id);
										}}
									>
										{isDeleting ? (
											<Loader2 className="size-3.5 animate-spin" />
										) : (
											<Trash2 className="size-3.5" />
										)}
									</Button>
								</div>
							);
						})}
						{openChat.isError && (
							<p role="alert" className="text-sm text-destructive">
								{openChat.error.message}
							</p>
						)}
						{deleteChat.isError && (
							<p role="alert" className="text-sm text-destructive">
								{deleteChat.error.message}
							</p>
						)}
					</div>
				)}

				<div className="flex flex-1 flex-col gap-7 overflow-y-auto px-4 py-8 sm:px-6 lg:px-12">
					{messages.length === 0 && (
						<div className="mx-auto flex max-w-2xl flex-col gap-5 pt-8 text-center">
							<h2 className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-3xl">
								What are you in the mood for?
							</h2>
							<p className="text-on-surface-variant">
								Describe a feeling, a half-remembered plot, or a film to move
								away from. Every suggestion is searched out of your own
								catalogue.
							</p>
							<div className="flex flex-wrap justify-center gap-2">
								{OPENERS.map((opener) => (
									<Button
										key={opener}
										variant="outline"
										className="h-auto cursor-pointer rounded-full px-3.5 py-2 text-[13px] whitespace-normal"
										onClick={() => sendMessage({ text: opener })}
									>
										{opener}
									</Button>
								))}
							</div>
						</div>
					)}

					{messages.map((message) => {
						if (message.role === "user") {
							return (
								<div key={message.id} className="flex justify-end">
									<div className="max-w-140 rounded-[18px] rounded-br-[6px] border border-primary/20 bg-primary/12 px-4.5 py-3.5 leading-6">
										{textOf(message)}
									</div>
								</div>
							);
						}
						const { suggestion } = splitSuggestion(textOf(message));
						return (
							<div key={message.id} className="flex gap-3.5">
								<span className="flex size-7.5 flex-none items-center justify-center rounded-[10px] bg-primary/14 text-primary">
									<Sparkles className="size-4" />
								</span>
								<div className="flex min-w-0 flex-1 flex-col gap-4">
									{message.parts.map((part, index) => {
										if (part.type === "text") {
											const { body } = splitSuggestion(part.text);
											if (!body.trim()) return null;
											return (
												<p
													key={partKey(message, part, index)}
													className="max-w-160 leading-6"
												>
													{body}
												</p>
											);
										}

										if (part.type !== "tool-searchMovies") return null;

										if (part.state !== "output-available") {
											return (
												<p
													key={partKey(message, part, index)}
													className="flex items-center gap-2 text-sm text-outline"
												>
													<Loader2 className="size-3.5 animate-spin" />
													Searching the catalogue…
												</p>
											);
										}

										const { movies } = part.output as SearchMoviesOutput;
										if (movies.length === 0) return null;

										return (
											<div
												key={partKey(message, part, index)}
												className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
											>
												{movies.map((movie) => (
													<AiMovieCard
														key={movie.id}
														movie={movie}
														isShortlisted={shortlist.some(
															(item) => item.id === movie.id,
														)}
														onToggleShortlist={toggleShortlist}
													/>
												))}
											</div>
										);
									})}
									{suggestion ? (
										<div>
											<Button
												variant="outline"
												className="h-8 cursor-pointer rounded-full px-3 text-[13px]"
												onClick={() => sendMessage({ text: suggestion })}
											>
												↻ Try: {suggestion}
											</Button>
										</div>
									) : null}
								</div>
							</div>
						);
					})}

					{isStreaming && (
						<p className="flex items-center gap-2 pl-11 text-sm text-outline">
							<Loader2 className="size-3.5 animate-spin" />
							Thinking…
						</p>
					)}

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error.message}
						</p>
					)}

					{openChat.isError && !isHistoryOpen && (
						<p role="alert" className="text-sm text-destructive">
							{openChat.error.message}
						</p>
					)}

					{messages.length > 0 && !isStreaming && (
						<div className="flex flex-wrap items-center gap-2 pl-11">
							<span className="text-xs font-semibold tracking-[0.1em] text-outline">
								NARROW IT
							</span>
							{NARROW_IT.map((suggestion) => (
								<Button
									key={suggestion}
									variant="outline"
									className="h-8 cursor-pointer rounded-full px-3 text-[13px]"
									onClick={() => sendMessage({ text: suggestion })}
								>
									{suggestion}
								</Button>
							))}
						</div>
					)}
				</div>

				<div className="px-4 pb-7 sm:px-6 lg:px-12">
					<ChatComposer
						defaultValue={seedQuery}
						isStreaming={isStreaming}
						model={model}
						models={chatModels.data ?? []}
						onModelChange={setModel}
						onSend={(text) => sendMessage({ text })}
						onStop={stop}
					/>
				</div>
			</div>

			<ShortlistRail
				movies={shortlist}
				isSaving={saveAll.isPending}
				saveError={saveAll.error?.message ?? null}
				onRemove={(movieId) =>
					setShortlist((current) =>
						current.filter((item) => item.id !== movieId),
					)
				}
				onClear={() => setShortlist([])}
				onSaveAll={() => saveAll.mutate(shortlist)}
			/>
		</main>
	);
};

export default AskPageContent;
