import { z } from "zod";
import { tool } from "@langchain/core/tools";

import prisma from "@/lib/prisma";

export const GET_KRS_SCHEDULE_STATUS = tool(
    async () => {
        const periode = await prisma.periodeAkademik.findFirst({
            where: { is_active: true },
            select: {
                is_active: true,
                tahun_akademik: true,
                jenis_semester: true,
                tanggal_mulai_krs: true,
                tanggal_selesai_krs: true,
                waktu_buka_harian: true,
                waktu_tutup_harian: true,
            },
        });

        if (!periode) {
            return {
                success: false,
                message: "Belum ada periode akademik yang aktif.",
            };
        }

        return {
            success: true,
            ...periode,
        };
    },
    {
        name: "GET_KRS_SCHEDULE_STATUS",
        description: "Memeriksa apakah hari ini berada dalam masa pengisian KRS dan mengembalikan status beserta jadwal KRS aktif.",
        schema: z.object({}),
    }
);