import { z } from "zod";
import { tool } from "@langchain/core/tools";

const MOCK_RAG = [
    {
        keywords: ["kalender akademik"],
        answer: "Tanggal terakhir perubahan KRS Semester Ganjil 2026 adalah 18 September 2026. (MOCK RAG)"
    },
    {
        keywords: ["sks", "maksimal", "ipk"],
        answer: `
Aturan beban SKS berdasarkan IPK:
- IPK < 2.00 → maksimal 12 SKS.
- IPK 2.00–2.49 → maksimal 16 SKS.
- IPK 2.50–2.99 → maksimal 20 SKS.
- IPK ≥ 3.00 → maksimal 24 SKS.
    `.trim(),
    },
    {
        keywords: ["pbo", "pemrograman berorientasi objek"],
        answer: `
Pemrograman Berorientasi Objek (PBO)
- Kode: IF203
- Bobot: 3 SKS
- Prasyarat: Lulus Algoritma dan Struktur Data.
    `.trim(),
    },
    {
        keywords: ["basis data", "database"],
        answer: `
Basis Data
- Kode: IF205
- Bobot: 3 SKS
- Prasyarat: Algoritma dan Struktur Data.
- Semester rekomendasi: Semester 4.
    `.trim(),
    },
    {
        keywords: ["jadwal senin", "senin"],
        answer: `
Jadwal Kuliah Hari Senin (Mock):
08.00–09.40  Pemrograman Berorientasi Objek
10.00–11.40  Basis Data
13.00–14.40  Interaksi Manusia dan Komputer
    `.trim(),
    },
];

export const ragTool = tool(
    async ({ query }) => {

        const text = query.toLowerCase();

        const result = MOCK_RAG.find((item) =>
            item.keywords.some((keyword) => text.includes(keyword))
        );

        if (result) {
            return result.answer;
        }

        return "Dokumen atau informasi yang diminta tidak ditemukan pada basis pengetahuan akademik.";
    },
    {
        name: "rag_query",
        description:
            "Mengambil informasi akademik dari basis pengetahuan KRS, kurikulum, jadwal, dan aturan SKS/IPK.",
        schema: z.object({
            query: z
                .string()
                .describe("Pertanyaan akademik yang ingin dicari pada basis pengetahuan."),
        }),
    }
);