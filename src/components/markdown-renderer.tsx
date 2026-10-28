import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="w-full min-w-0 max-w-full text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mt-4 mb-2 text-xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-3 mb-2 text-lg font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-2.5 mb-1.5 text-base font-semibold">{children}</h3>,

          p: ({ children }) => <p className="mb-2.5 leading-6 last:mb-0">{children}</p>,

          ul: ({ children }) => <ul className="mb-2.5 ml-5 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2.5 ml-5 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-6">{children}</li>,

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-border pl-3 italic text-muted-foreground">{children}</blockquote>
          ),

          // Wrapper table diisolasi dengan overflow horizontal & min-w-max agar tidak terpotong
          table: ({ children }) => (
            <div className="my-3 w-full max-w-full overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-max border-collapse text-xs sm:text-sm">{children}</table>
            </div>
          ),

          thead: ({ children }) => <thead className="bg-muted/70">{children}</thead>,

          th: ({ children }) => (
            <th className="border-b border-border px-3 py-2 text-left font-semibold whitespace-nowrap text-foreground">{children}</th>
          ),

          td: ({ children }) => <td className="border-b border-border px-3 py-2 whitespace-nowrap text-foreground/90">{children}</td>,

          // Code block & inline code handling agar tidak mendesak bubble
          pre: ({ children }) => (
            <div className="my-2 w-full max-w-full overflow-x-auto rounded-md bg-muted/80 p-3">
              <pre className="text-xs font-mono">{children}</pre>
            </div>
          ),

          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={className}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
