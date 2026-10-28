import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MessageRole } from "@/generated/prisma/enums";

const TypingIndicator = () => (
  <div className="flex h-5 items-center gap-1.5 px-1 py-1">
    <div
      className="size-1.5 animate-bounce rounded-full bg-foreground/40"
      style={{ animationDelay: "0ms" }}
    />
    <div
      className="size-1.5 animate-bounce rounded-full bg-foreground/40"
      style={{ animationDelay: "150ms" }}
    />
    <div
      className="size-1.5 animate-bounce rounded-full bg-foreground/40"
      style={{ animationDelay: "300ms" }}
    />
  </div>
);

type ChatBubbleProps = ComponentProps<"div"> & {
  role: MessageRole;
  content: string;
  time?: string;
  avatar?: ReactNode;
  isThinking?: boolean;
  bubbleClassName?: string;
  avatarClassName?: string;
};

export function ChatBubble({ role, content, time, avatar, className, bubbleClassName, avatarClassName, isThinking, ...props }: ChatBubbleProps) {
  const isUser = role === "USER";

  return (
    <div
      className={cn("flex w-full min-w-0 gap-3", isUser ? "justify-end" : "justify-start", className)}
      {...props}
    >
      {!isUser && (
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/60 text-white", avatarClassName)}>
          {avatar ?? <Bot size={18} />}
        </div>
      )}

      {/* Tambahkan min-w-0 agar flex child bisa mengecil sesuai batasan lebar */}
      <div className={cn("flex max-w-[85%] min-w-0 flex-col sm:max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "w-full min-w-0 max-w-full overflow-x-auto rounded-2xl px-4 py-3 text-sm leading-relaxed break-words [overflow-wrap:anywhere]",
            isUser ? "rounded-br-md bg-primary/60 text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
            bubbleClassName,
          )}
        >
          {isThinking ? (
            <TypingIndicator />
          ) : isUser ? (
            content
          ) : (
            <div className="min-w-0 w-full overflow-x-auto">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>

        {isUser && time && <span className="mt-1 px-1 text-xs text-muted-foreground">{time}</span>}
      </div>
    </div>
  );
}
