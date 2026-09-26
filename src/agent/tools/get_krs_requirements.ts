import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { caller } from "@/trpc/server";

export const GET_KRS_REQUIREMENTS = tool(
    async () => {
        return caller.krs.getSyaratKrs();
    },
    {
        name: "GET_KRS_REQUIREMENTS",
        description:
            "Mengambil status seluruh syarat pengisian KRS mahasiswa, termasuk pembayaran, status mahasiswa, semester, dan jadwal KRS.",
        schema: z.object({}),
    }
);