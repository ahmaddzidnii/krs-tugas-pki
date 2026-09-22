

import prisma from "@/lib/prisma";

export async function getKrsScheduleStatus() {
    const now = new Date();

    const periode = await prisma.periodeAkademik.findFirst({
        where: { is_active: true },
    });

    if (!periode) {
        return {
            isKrsOpen: false,
            reason: "NO_ACTIVE_PERIOD" as const,
            periode: null,
        };
    }

    const tanggalSelesai = new Date(periode.tanggal_selesai_krs);
    tanggalSelesai.setHours(23, 59, 59, 999);

    const isWithinDateRange =
        now >= periode.tanggal_mulai_krs && now <= tanggalSelesai;

    if (!isWithinDateRange) {
        return {
            isKrsOpen: false,
            reason: "OUTSIDE_DATE" as const,
            periode,
        };
    }

    const toMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = toMinutes(periode.waktu_buka_harian);
    const endMinutes = toMinutes(periode.waktu_tutup_harian);

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return {
            isKrsOpen: false,
            reason: "OUTSIDE_TIME" as const,
            periode,
        };
    }

    return {
        isKrsOpen: true,
        reason: "OPEN" as const,
        periode,
    };
}