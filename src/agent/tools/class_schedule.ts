import { z } from "zod";
import { tool } from "@langchain/core/tools";

export const GET_CLASS_SCHEDULE = tool(
    async ({ day }) => {
        const value = day.toLowerCase();

        if (value.includes("senin")) {
            return `
Jadwal Kuliah Hari Senin:
08.00–09.40  Pemrograman Berorientasi Objek
10.00–11.40  Basis Data
13.00–14.40  Interaksi Manusia dan Komputer
      `.trim();
        }

        return "Jadwal kuliah untuk hari tersebut tidak ditemukan.";
    },
    {
        name: "GET_CLASS_SCHEDULE",
        description: "Mengambil jadwal kuliah berdasarkan hari.",
        schema: z.object({
            day: z.string().describe("Hari kuliah, misalnya Senin atau Selasa."),
        }),
    }
);