import { ArrowUp, Mic, Square } from "lucide-react";
import { useAgentStore } from "../stores/use-agent-store";

export const ChatInput = () => {
  const { input, setInput, isRecording, toggleRecording, sendMessage, isLoading } = useAgentStore();

  return (
    <footer className="shrink-0 border-t p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !isLoading) {
              sendMessage();
            }
          }}
          disabled={isLoading}
          placeholder="Tanyakan sesuatu..."
          className="
            min-w-0 flex-1 rounded-xl border bg-muted/40
            px-4 py-3 text-sm outline-none
            placeholder:text-muted-foreground
            focus:ring-2 focus:ring-[#005a00]/20
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        {/* Tombol Rekam */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`
            size-11 shrink-0 inline-flex items-center justify-center rounded-xl
            transition-all active:scale-95
            ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-muted text-[#005a00] hover:bg-[#005a00]/10"}
          `}
        >
          {isRecording ? <Square className="size-5 fill-current" /> : <Mic className="size-5" />}
        </button>

        {/* Tombol Kirim */}
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="
            size-11 shrink-0 inline-flex items-center justify-center rounded-xl
            bg-[#005a00] text-white transition-all
            hover:bg-[#004800] active:scale-95
            disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed
          "
        >
          <ArrowUp className="size-5" />
        </button>
      </div>

      {isRecording && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-500">
          <span className="size-2 rounded-full bg-red-500 animate-ping" />
          <span>Sedang merekam...</span>
        </div>
      )}

      <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        AI dapat melakukan kesalahan. Verifikasi informasi dan tindakan sebelum mengambil keputusan penting.
      </p>
    </footer>
  );
};
