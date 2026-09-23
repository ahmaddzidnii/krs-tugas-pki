"use client";

import { ArrowUp, BookOpen, CalendarDays, ChevronDown, Mic, Search, Square, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SukaKrsAgentModalProps {
  open: boolean;
  onClose: () => void;
}

export function SukaKrsAgentModal({ open, onClose }: SukaKrsAgentModalProps) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const [isRecording, setIsRecording] = useState(false);

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
          sm:w-[420px]
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
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col px-5 py-10">
            {/* Greeting */}
            <div className="text-center">
              <p className="text-lg font-semibold">Halo, Ahmad Zidni Hidayat</p>

              <h3 className="mt-2 text-xl font-semibold tracking-tight">Apa yang ingin kita kerjakan hari ini?</h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Saya <span className="font-semibold text-[#005a00]">SUKA KRS Agent</span>, siap membantu menyusun KRS, mengecek jadwal, dan menjawab
                pertanyaan akademikmu.
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />

              <span className="shrink-0 text-xs text-muted-foreground">atau jelajahi</span>

              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className="
          flex h-24 flex-col items-center justify-center
          rounded-xl border p-3 text-center
          transition-all
          hover:bg-muted/50
          hover:shadow-sm
          active:scale-[0.98]
        "
              >
                <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#005a00]/10 text-[#005a00]">
                  <Search className="size-4" />
                </div>

                <span className="text-xs font-medium">Cari mata kuliah</span>
              </button>

              <button
                type="button"
                className="
          flex h-24 flex-col items-center justify-center
          rounded-xl border p-3 text-center
          transition-all
          hover:bg-muted/50
          hover:shadow-sm
          active:scale-[0.98]
        "
              >
                <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#005a00]/10 text-[#005a00]">
                  <CalendarDays className="size-4" />
                </div>

                <span className="text-xs font-medium">Lihat kurikulum</span>
              </button>

              <button
                type="button"
                className="
          flex h-24 flex-col items-center justify-center
          rounded-xl border p-3 text-center
          transition-all
          hover:bg-muted/50
          hover:shadow-sm
          active:scale-[0.98]
        "
              >
                <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#005a00]/10 text-[#005a00]">
                  <BookOpen className="size-4" />
                </div>

                <span className="text-xs font-medium">Cek KRS</span>
              </button>
            </div>
          </div>
        </main>

        {/* Input */}
        <footer className="shrink-0 border-t p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tanyakan sesuatu..."
              className="
        min-w-0 flex-1 rounded-xl border bg-muted/40
        px-4 py-3 text-sm outline-none
        placeholder:text-muted-foreground
        focus:ring-2 focus:ring-[#005a00]/20
      "
            />

            {/* Tombol Rekam */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
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
              className="
        size-11 shrink-0 inline-flex items-center justify-center rounded-xl
        bg-[#005a00] text-white transition-all
        hover:bg-[#004800] active:scale-95
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
      </section>
    </div>
  );
}
