import { z } from "zod";
import { tool } from "@langchain/core/tools";

export const GET_ACADEMIC_RULES = tool(
    async ({ topic }) => {
        const text = topic.toLowerCase();

        if (text.includes("sks") || text.includes("ipk")) {
            return `
Aturan beban SKS berdasarkan IPK:
- IPK < 2.00 → maksimal 12 SKS.
- IPK 2.00–2.49 → maksimal 16 SKS.
- IPK 2.50–2.99 → maksimal 20 SKS.
- IPK ≥ 3.00 → maksimal 24 SKS.
      `.trim();
        }

        return "Aturan akademik tidak ditemukan.";
    },
    {
        name: "GET_ACADEMIC_RULES",
        description: "Mengambil aturan akademik seperti batas SKS, IPK, prasyarat umum, dan ketentuan KRS.",
        schema: z.object({
            topic: z.string().describe("Topik aturan akademik yang ingin dicari."),
        }),
    }
);