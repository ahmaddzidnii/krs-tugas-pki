"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

  // State untuk menahan unmount saat animasi close berjalan
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      // Double rAF / setTimeout kecil agar browser trigger class transition
      const frame = requestAnimationFrame(() => setIsVisible(true));
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        cancelAnimationFrame(frame);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 250); // Sesuaikan dengan duration-250 di class transition

      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-100 transition-opacity duration-250 ease-out ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop dengan transisi blur & fade */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Card */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suka-krs-agent-title"
        className={`
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

          origin-bottom-right
          transition-all duration-250 ease-out
          ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 sm:translate-y-6"}
        `}
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
