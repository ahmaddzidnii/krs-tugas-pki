import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const GET_COURSE_CAPACITY = tool(
    async ({ classIds }) => {
        return caller.krs.getStatusKuotaKelasBatch({
            id_kelas: classIds,
        });
    },
    {
        name: "GET_COURSE_CAPACITY",
        description:
            "Mengambil status kuota beberapa kelas sekaligus, termasuk jumlah kuota, jumlah terisi, apakah kelas penuh, dan apakah mahasiswa sudah mengambil kelas tersebut.",
        schema: z.object({
            classIds: z
                .array(z.string())
                .describe("Daftar ID kelas yang ingin diperiksa status kuotanya."),
        }),
    }
);