"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";

import ChatList from "./chat-list";
import { ChatInput } from "./chat-input";
import { WelcomeState } from "./welcome-state";
import { useAgentStore } from "../stores/use-agent-store";

interface SukaKrsAgentModalProps {
  open: boolean;
  onClose: () => void;
}

export function AgentDialog({ open, onClose }: SukaKrsAgentModalProps) {
  const hasMessages = useAgentStore((state) => state.messages.length > 0);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {/* Modal */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suka-krs-agent-title"
        className="
          absolute
          inset-0

          flex flex-col
          overflow-hidden
          bg-white

          sm:inset-auto
          sm:right-5
          sm:bottom-5
          sm:h-[min(700px,calc(100vh-40px))]
          sm:w-137.5
          sm:rounded-2xl
          sm:shadow-2xl
        "
      >
        {/* Header */}
        <header
          className="
            flex shrink-0 items-center justify-between
            border-b px-5 py-4
          "
        >
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-full bg-white">
              <Image
                src="/ai-logo.png"
                alt=""
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <h2
                id="suka-krs-agent-title"
                className="font-semibold leading-tight"
              >
                SUKA KRS Agent
              </h2>

              <p className="text-xs text-muted-foreground">Asisten akademik berbasis AI</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close SUKA KRS Agent"
            className="
              rounded-lg p-2
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
          >
            <ChevronDown className="size-5" />
          </button>
        </header>

        {/* Chat */}
        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-10">{hasMessages ? <ChatList /> : <WelcomeState />}</main>

        {/* Input */}
        <ChatInput />
      </section>
    </div>
  );
}
