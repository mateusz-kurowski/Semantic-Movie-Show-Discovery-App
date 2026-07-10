"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { getQueryClient } from "@/lib/query-client";

let queryClient: ReturnType<typeof getQueryClient> | undefined;

const Providers = ({ children }: PropsWithChildren) => {
  if (!queryClient) {
    queryClient = getQueryClient();
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default Providers;
