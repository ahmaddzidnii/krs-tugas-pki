import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="mt-6 mb-3 text-2xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-5 mb-2 text-xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>,

        p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,

        ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>,

        ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>,

        li: ({ children }) => <li>{children}</li>,

        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {children}
          </a>
        ),

        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">{children}</blockquote>
        ),

        table: ({ children }) => (
          <div className="mb-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),

        th: ({ children }) => <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">{children}</th>,

        td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
