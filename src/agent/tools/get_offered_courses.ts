import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const GET_OFFERED_COURSES = tool(
    async () => {
        return caller.krs.getPenawaranKelas();
    },
    {
        name: "GET_OFFERED_COURSES",
        description:
            "Mengambil daftar seluruh kelas yang ditawarkan kepada mahasiswa yang sedang login sesuai kurikulum dan periode akademik aktif.",
        schema: z.object({}),
    }
);