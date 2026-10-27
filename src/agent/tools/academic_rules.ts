import { z } from "zod";
import { tool } from "@langchain/core/tools";
import type { getServerSideSession } from "@/lib/auth";
import { searchVectorStore } from "../rag/vectorstore";

export const SEARCH_ACADEMIC_RULES = tool(
    async ({ query }, config) => {
        try {
            // 1. Ekstrak session mahasiswa dari config harness LangChain
            const session = config.configurable?.session as
                | Awaited<ReturnType<typeof getServerSideSession>>
                | undefined;

            const mahasiswa = session?.user;

            const results = await searchVectorStore(query, {
                topK: 3,
                minScore: 0.55, // Mengabaikan dokumen dengan kemiripan di bawah 55%
                filter: mahasiswa
                    ? {
                        jenjang: mahasiswa.programStudi?.jenjang_studi ?? "S1",
                        fakultas: mahasiswa.fakultas ?? "FST",
                        prodi: mahasiswa.programStudi?.nama ?? "Informatika",
                    }
                    : undefined, // Jika mode Guest/belum login, cari di lingkup umum
            });

            if (!results.length) {
                return "Aturan akademik terkait hal tersebut tidak ditemukan di pedoman akademik yang relevan.";
            }

            // 3. Format hasil untuk konteks LLM
            return results
                .map((r) => {
                    const confidence = (r.score * 100).toFixed(1);
                    return `[Dokumen: "${r.fileName}" | Hal. ${r.page} | Relevansi: ${confidence}%]:\n${r.content}`;
                })
                .join("\n\n---\n\n");
        } catch (error: any) {
            console.error("[SEARCH_ACADEMIC_RULES_ERROR]:", error);
            return `Gagal mengakses data aturan akademik: ${error?.message ?? "Terjadi kesalahan internal"}`;
        }
    },
    {
        name: "SEARCH_ACADEMIC_RULES",
        description:
            "Mencari aturan akademik resmi kampus (batas SKS berdasarkan IPK, syarat cuti, sanksi DO, ketentuan KRS, kurikulum, panduan skripsi/tugas akhir) dari dokumen pedoman yang relevan.",
        schema: z.object({
            query: z
                .string()
                .describe("Pertanyaan atau topik aturan akademik yang dicari."),
        }),
    }
);