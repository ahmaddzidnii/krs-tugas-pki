"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";

type AgentContextType = {
  threadId: string | null;
  isLoading: boolean;
  isReady: boolean;
  refetch: () => Promise<unknown>;
};

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const agent = useAgent();

  return <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>;
}

export function useAgentContext() {
  const context = useContext(AgentContext);

  if (!context) {
    throw new Error("useAgentContext harus digunakan di dalam AgentProvider.");
  }

  return context;
}

export function useAgent() {
  const query = useQuery(agentInitOptions);

  return {
    threadId: query.data?.threadId ?? null,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    refetch: query.refetch,
  };
}

export const agentInitOptions = queryOptions({
  queryKey: ["agent", "thread"],
  queryFn: async () => {
    const response = await fetch("/api/agent/init", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Gagal menginisialisasi Agent.");
    }

    return response.json() as Promise<{
      threadId: string;
    }>;
  },
  staleTime: 23 * 60 * 60 * 1000, // 23 jam
  gcTime: 24 * 60 * 60 * 1000, // 24 jam
});
