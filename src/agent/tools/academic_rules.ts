// src/ai/tools/academic-rules.tool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { searchVectorStore } from "../rag/vectorstore";

export const SEARCH_ACADEMIC_RULES = tool(
    async ({ query }) => {
        try {
            const results = await searchVectorStore(query, 3);

            if (!results.length || results[0].score < 0.3) {
                return "Aturan akademik terkait hal tersebut tidak ditemukan di dokumen panduan manapun.";
            }

            // Format output mencakup nama file dokumen & nomor halamannya
            return results
                .map((r, i) => {
                    const confidence = (r.score * 100).toFixed(1);
                    return `[Dokumen: "${r.fileName}" | Hal. ${r.page} | Relevansi: ${confidence}%]:\n${r.content}`;
                })
                .join("\n\n---\n\n");
        } catch (error: any) {
            console.error("[SEARCH_ACADEMIC_RULES_ERROR]:", error);
            return `Gagal mengakses data aturan akademik: ${error.message}`;
        }
    },
    {
        name: "SEARCH_ACADEMIC_RULES",
        description:
            "Mencari aturan akademik resmi kampus (batas SKS berdasarkan IPK, syarat cuti, sanksi DO, ketentuan KRS, kurikulum) dari seluruh buku pedoman PDF yang tersedia.",
        schema: z.object({
            query: z
                .string()
                .describe("Pertanyaan atau topik aturan akademik yang dicari."),
        }),
    }
);