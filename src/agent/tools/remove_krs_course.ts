import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const REMOVE_KRS_COURSE = tool(
    async ({ classId }) => {
        return caller.krs.hapusKelas({
            id_kelas: classId,
        });
    },
    {
        name: "REMOVE_KRS_COURSE",
        description:
            "Menghapus satu kelas dari KRS mahasiswa pada periode akademik aktif. Gunakan hanya setelah pengguna memberikan konfirmasi untuk menghapus kelas.",
        schema: z.object({
            classId: z
                .string()
                .describe("ID kelas yang akan dihapus dari KRS mahasiswa."),
        }),
    }
);