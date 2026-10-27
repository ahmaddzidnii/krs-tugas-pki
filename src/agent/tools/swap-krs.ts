import z from "zod";
import { tool } from "@langchain/core/tools";
import { caller } from "@/trpc/server";

export const SWAP_KRS_TOOL = tool(
    async ({ dropClassId, addClassId }) => {
        return await caller.krs.tukarKelas(
            {
                id_kelas_ambil: addClassId,
                id_kelas_batal: dropClassId,
            }
        );
    },
    {
        name: "SWAP_KRS_COURSE",
        description: "Gunakan tool ini ketika ingin menukar atau mengganti kelas lama dengan kelas baru.",
        schema: z.object({
            dropClassId: z.string().describe("ID kelas yang ingin dibatalkan/dihapus"),
            addClassId: z.string().describe("ID kelas baru yang ingin diambil"),
        }),
    }
);