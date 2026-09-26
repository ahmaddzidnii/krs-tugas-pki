import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const GET_CURRENT_KRS = tool(
    async () => {
        return caller.krs.getDataKelasYangDiambil();
    },
    {
        name: "GET_CURRENT_KRS",
        description:
            "Mengambil seluruh mata kuliah dan kelas yang saat ini sudah diambil mahasiswa pada periode KRS aktif.",
        schema: z.object({}),
    }
);