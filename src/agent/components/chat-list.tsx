import Image from "next/image";
import { ChatBubble } from "./chat-bubble";
import { useAgentStore } from "../stores/use-agent-store";
import { useEffect, useRef } from "react";

export default function ChatList() {
  const { messages, isLoading } = useAgentStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-5">
      {messages.map((msg, index) => {
        const isLastMessage = index === messages.length - 1;
        const isThinking = isLastMessage && msg.role === "ASSISTANT" && isLoading && msg.content === "";
        return (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isThinking={isThinking}
            time={msg.time}
            avatar={
              <div className="relative size-10 overflow-hidden rounded-full bg-white">
                <Image
                  src="/ai-logo.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
            }
          />
        );
      })}
      <div
        ref={bottomRef}
        className="h-1"
      />
    </div>
  );
}
