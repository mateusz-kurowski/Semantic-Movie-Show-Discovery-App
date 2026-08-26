"use client";
import type { PropsWithChildren } from "react";

const layout = ({ children }: PropsWithChildren) => {
	return (
		<main className="flex-1 flex items-center justify-center px-4 py-8">
			{children}
		</main>
	);
};

export default layout;
