"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { makeQueryClient } from "./query-client";

const Providers = ({ children }: PropsWithChildren) => {
	const queryClient = makeQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>{children}</TooltipProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
};

export default Providers;
