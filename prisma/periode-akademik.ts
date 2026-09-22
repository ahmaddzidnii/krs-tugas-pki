import { PeriodeAkademik } from "../app/generated/prisma/client";
import { prismaInstanceForSeeding } from "./seed";

export async function seedPeriodeAkademik() {
    const periodeAkademikData = [
        {
            tahun_akademik: '2025/2026',
            jenis_semester: 'GANJIL' as PeriodeAkademik["jenis_semester"],
            is_active: true,
            tanggal_mulai_krs: new Date('2025-08-01'),
            tanggal_selesai_krs: new Date('2025-08-31'),
            waktu_buka_harian: '08:00',
            waktu_tutup_harian: '16:00',
        },
    ];

    await prismaInstanceForSeeding.periodeAkademik.createMany({
        data: periodeAkademikData.map((periode) => ({
            ...periode,
            created_at: BigInt(Date.now()),
            updated_at: BigInt(Date.now()),
        })),
        skipDuplicates: true,
    });
}