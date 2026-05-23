"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

const QueryProvider = (props: QueryProviderProps) => {
  const client = useRef<QueryClient | null>(null);
  if (client.current == null) {
    client.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={client.current}>
      {props.children}
    </QueryClientProvider>
  );
};

QueryProvider.displayName = "QueryProvider";
export default QueryProvider;
