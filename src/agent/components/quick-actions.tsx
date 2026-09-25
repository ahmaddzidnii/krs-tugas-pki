import { BookOpen, CalendarDays, Search } from "lucide-react";

export const QuickActions = () => {
  return (
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
  );
};
