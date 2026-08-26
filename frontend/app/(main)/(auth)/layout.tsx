"use client";
import type { PropsWithChildren } from "react";

const layout = ({ children }: PropsWithChildren) => {
	return (
		<main className="relative flex-1 flex items-center justify-center px-4 py-8">
			<div
				aria-hidden
				className="pointer-events-none absolute top-0 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
			/>
			<div className="relative w-full flex justify-center">{children}</div>
		</main>
	);
};

export default layout;
