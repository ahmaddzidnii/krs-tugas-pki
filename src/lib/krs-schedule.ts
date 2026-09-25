

import prisma from "@/lib/prisma";

import { formatInTimeZone } from "date-fns-tz";

const TZ = "Asia/Jakarta";

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

    // Tanggal dalam WIB (YYYY-MM-DD)
    const today = formatInTimeZone(now, TZ, "yyyy-MM-dd");
    const startDate = formatInTimeZone(periode.tanggal_mulai_krs, TZ, "yyyy-MM-dd");
    const endDate = formatInTimeZone(periode.tanggal_selesai_krs, TZ, "yyyy-MM-dd");

    if (today < startDate || today > endDate) {
        return {
            isKrsOpen: false,
            reason: "OUTSIDE_DATE" as const,
            periode,
        };
    }

    const [hour, minute] = formatInTimeZone(now, TZ, "HH:mm")
        .split(":")
        .map(Number);

    const currentMinutes = hour * 60 + minute;

    const toMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const startMinutes = toMinutes(periode.waktu_buka_harian);
    const endMinutes = toMinutes(periode.waktu_tutup_harian);

    if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
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