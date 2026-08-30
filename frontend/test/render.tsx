import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/** Renders inside a fresh QueryClient so cached data never leaks between tests. */
export const renderWithQuery = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { gcTime: 0, retry: false } },
	});

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
};
