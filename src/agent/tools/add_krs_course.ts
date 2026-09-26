import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const ADD_KRS_COURSE = tool(
    async ({ classId }) => {
        return caller.krs.ambilKelas({
            id_kelas: classId,
        });
    },
    {
        name: "ADD_KRS_COURSE",
        description:
            "Menambahkan satu kelas ke KRS mahasiswa pada periode akademik aktif. Gunakan hanya setelah pengguna memberikan konfirmasi untuk menambahkan kelas.",
        schema: z.object({
            classId: z
                .string()
                .describe("ID kelas yang akan ditambahkan ke KRS mahasiswa."),
        }),
    }
);