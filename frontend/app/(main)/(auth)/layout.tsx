"use client";
import type { PropsWithChildren } from "react";

const layout = ({ children }: PropsWithChildren) => {
	return (
		<main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,--theme(--color-primary/12%),transparent_78%)]"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-40 left-1/2 h-100 w-150 max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,--theme(--color-primary/20%),transparent)]"
			/>
			<div className="relative flex w-full justify-center">{children}</div>
		</main>
	);
};

export default layout;
