"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAgentStore } from "../stores/use-agent-store";

interface ChatSyncProviderProps {
  children: React.ReactNode;
}

export const ChatSyncProvider = ({ children }: ChatSyncProviderProps) => {
  const trpc = useTRPC();
  const { data: messagesData, isLoading } = useQuery(
    trpc.agent.loadChat.queryOptions(undefined, {
      refetchOnWindowFocus: false,
    }),
  );

  useEffect(() => {
    if (messagesData) {
      const formatedMessages = messagesData.messages.map((msg) => {
        const safeTimestamp = msg.created_at ? Number(msg.created_at) : Date.now();
        return {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          time: new Date(safeTimestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
      });

      useAgentStore.setState({ messages: formatedMessages });
    }
  }, [messagesData]);

  if (isLoading) {
    return <div>Loading chat...</div>;
  }

  return <>{children}</>;
};
