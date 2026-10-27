import { CalendarClock, GraduationCap } from "lucide-react";
import { useAgentStore } from "@/agent/stores/use-agent-store";

export const QuickActions = () => {
  const setInput = useAgentStore((state) => state.setInput);
  const sendMessage = useAgentStore((state) => state.sendMessage);
  const isLoading = useAgentStore((state) => state.isLoading);

  const handleActionClick = (prompt: string) => {
    if (isLoading) return;
    setInput(prompt);
    setTimeout(() => {
      sendMessage();
    }, 0);
  };

  const agentPrompts = [
    {
      icon: CalendarClock,
      title: "Jadwal & Batas KRS",
      subtitle: "Cek tanggal buka & tutup",
      prompt: "Kapan jadwal pengisian dan batas akhir KRS semester ini?",
    },
    {
      icon: GraduationCap,
      title: "Aturan Kuota SKS",
      subtitle: "Batas SKS berdasarkan IP",
      prompt: "Berapa batas maksimal SKS yang bisa diambil berdasarkan nilai IP semester lalu?",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {agentPrompts.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            disabled={isLoading}
            onClick={() => handleActionClick(item.prompt)}
            className="
              flex h-24 flex-col items-center justify-center
              rounded-xl border p-3 text-center
              transition-all
              hover:bg-muted/50
              hover:shadow-sm
              active:scale-[0.98]
              disabled:pointer-events-none disabled:opacity-50
            "
          >
            <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#005a00]/10 text-[#005a00]">
              <Icon className="size-4" />
            </div>

            <span className="text-xs font-semibold">{item.title}</span>
            <span className="text-[10px] text-muted-foreground">{item.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
};
