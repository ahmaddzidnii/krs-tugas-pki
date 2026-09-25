export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 h-5 px-1">
      <div
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
};
