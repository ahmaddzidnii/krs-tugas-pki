import { z } from "zod";
import { tool } from "@langchain/core/tools";

export const krsTool = tool(
    async ({ matkulId }, config) => {
        // Di sini kamu panggil tRPC procedure atau service KRS-mu.
        // user_id diambil dari config/konteks backend, BUKAN dari AI.
        // const result = await trpc.krs.tambahMatkul({ matkulId, userId: config.userId });

        return `Berhasil menambahkan matkul ${matkulId} ke KRS.`;
    },
    {
        name: "tambah_matkul_krs",
        description: "Gunakan untuk menambah mata kuliah ke KRS. Panggil tool ini HANYA JIKA pengguna sudah secara eksplisit membalas 'Ya/Setuju' di chat terakhir.",
        schema: z.object({
            matkulId: z.string().describe("Nama atau kode mata kuliah yang ingin ditambah"),
        }),
    }
);
