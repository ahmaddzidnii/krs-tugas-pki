import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { formatInTimeZone } from "date-fns-tz";

const TZ = "Asia/Jakarta";

export const GET_CURRENT_DATETIME = tool(
    async () => {
        const now = new Date();

        return {
            timezone: TZ,
            iso: now.toISOString(),
            date: formatInTimeZone(now, TZ, "yyyy-MM-dd"),
            time: formatInTimeZone(now, TZ, "HH:mm:ss"),
            dayName: formatInTimeZone(now, TZ, "EEEE"),
            formatted: formatInTimeZone(
                now,
                TZ,
                "EEEE, dd MMMM yyyy HH:mm:ss 'WIB'"
            ),
        };
    },
    {
        name: "GET_CURRENT_DATETIME",
        description:
            "WAJIB digunakan untuk semua pertanyaan yang menyebut hari ini, sekarang, saat ini, besok, kemarin, tanggal, waktu, jam, atau yang bergantung pada tanggal dan waktu saat ini di zona waktu Asia/Jakarta (WIB). Jangan menjawab berdasarkan pengetahuan internal model.",
        schema: z.object({}),
    }
);