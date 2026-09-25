import { useAuth } from "@/contexts/auth-context";
import { BookOpen, CalendarDays, Search } from "lucide-react";
import { QuickActions } from "./quick-actions";

export const WelcomeState = () => {
  const { user } = useAuth();

  const userName = user?.nama || "Civitas Akademika UIN SUKA";
  return (
    <div className="flex min-h-full flex-col">
      <div className="text-center">
        <p className="text-lg font-semibold">Halo, {userName}</p>

        <h3 className="mt-2 text-xl font-semibold tracking-tight">Apa yang ingin kita kerjakan hari ini?</h3>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Saya <span className="font-semibold text-[#005a00]">SUKA KRS Agent</span>, siap membantu menyusun KRS, mengecek jadwal, dan menjawab
          pertanyaan akademikmu.
        </p>
      </div>

      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />

        <span className="shrink-0 text-xs text-muted-foreground">atau jelajahi</span>

        <div className="h-px flex-1 bg-border" />
      </div>

      <QuickActions />
    </div>
  );
};
