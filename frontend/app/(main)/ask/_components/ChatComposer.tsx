"use client";
import { ArrowUp, Square } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
	defaultValue?: string;
	isStreaming: boolean;
	model?: string;
	models: string[];
	onModelChange: (model: string) => void;
	onSend: (text: string) => void;
	onStop: () => void;
}

const ChatComposer = ({
	defaultValue,
	isStreaming,
	model,
	models,
	onModelChange,
	onSend,
	onStop,
}: ChatComposerProps) => {
	const [text, setText] = useState(defaultValue ?? "");

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed || isStreaming) return;
		setText("");
		onSend(trimmed);
	};

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		submit();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			submit();
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-2.5 rounded-[20px] border border-foreground/12 bg-card p-3.5"
		>
			<label htmlFor="ai-composer" className="sr-only">
				Message ReelFind AI
			</label>
			<Textarea
				id="ai-composer"
				rows={2}
				value={text}
				onChange={(event) => setText(event.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Describe the feeling, the plot you half-remember, or the film to move away from…"
				className="min-h-14 resize-none border-0 bg-transparent px-1 text-base leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
			/>
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					{models.length > 0 && (
						<Select
							value={model}
							onValueChange={(value) => {
								if (value) onModelChange(value);
							}}
						>
							<SelectTrigger
								size="sm"
								aria-label="Chat model"
								className="h-7 max-w-36 rounded-full border-foreground/12 bg-transparent px-2.5 text-[12px] text-outline sm:max-w-48"
							>
								<SelectValue placeholder="Default model" />
							</SelectTrigger>
							<SelectContent>
								{models.map((id) => (
									<SelectItem key={id} value={id}>
										{id}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					<span className="hidden text-[11px] text-outline sm:inline">
						⏎ send · ⇧⏎ newline
					</span>
				</div>
				{isStreaming ? (
					<Button
						type="button"
						aria-label="Stop generating"
						onClick={onStop}
						className="ml-auto size-10 cursor-pointer rounded-full"
					>
						<Square />
					</Button>
				) : (
					<Button
						type="submit"
						aria-label="Send"
						disabled={!text.trim()}
						className="ml-auto size-10 cursor-pointer rounded-full"
					>
						<ArrowUp />
					</Button>
				)}
			</div>
		</form>
	);
};

export default ChatComposer;
