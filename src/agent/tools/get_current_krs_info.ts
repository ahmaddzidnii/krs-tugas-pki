import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const GET_CURRENT_KRS_INFO = tool(
    async () => {
        return caller.krs.getInformasiUmum();
    },
    {
        name: "GET_CURRENT_KRS_INFO",
        description:
            "Mengambil ringkasan informasi akademik mahasiswa pada periode KRS aktif seperti IPK, IPS terakhir, jatah SKS, SKS yang sudah diambil, dan sisa SKS.",
        schema: z.object({}),
    }
);