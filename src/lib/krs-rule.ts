import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const STATUS_MAHASISWA_MAP: Record<string, string> = {
    AKTIF: "Aktif",
    CUTI: "Cuti",
    DISPENSASI: "Dispensasi",
};

export const STATUS_PEMBAYARAN_MAP: Record<string, string> = {
    LUNAS: "Sudah Bayar",
    BELUM_LUNAS: "Belum Bayar",
};

export interface MahasiswaKrs {
    status_pembayaran: string;
    status_mahasiswa: string;
    semester_berjalan: number;
}

export interface PeriodeAktifKrs {
    tanggal_mulai_krs: Date;
    tanggal_selesai_krs: Date;
}

export interface SyaratKrsItem {
    syarat: string;
    isi: string;
    boolean: boolean;
    pesanError: string;
}

export function getSyaratKrsList(
    mahasiswa: MahasiswaKrs,
    periodeAktif: PeriodeAktifKrs
): SyaratKrsItem[] {
    const today = new Date();

    const tanggalMulai = new Date(periodeAktif.tanggal_mulai_krs);

    const tanggalSelesai = new Date(periodeAktif.tanggal_selesai_krs);
    tanggalSelesai.setHours(23, 59, 59, 999);

    const isJadwalValid =
        today >= tanggalMulai &&
        today <= tanggalSelesai;

    const isSemesterValid =
        mahasiswa.semester_berjalan >= 3 &&
        mahasiswa.semester_berjalan <= 14;

    return [
        {
            syarat: `Tanggal Pengisian KRS = ${periodeAktif.tanggal_mulai_krs.toLocaleDateString()} s.d ${periodeAktif.tanggal_selesai_krs.toLocaleDateString()}`,
            isi: `${today.toLocaleDateString()}`,
            boolean: isJadwalValid,
            pesanError: "Masa pengisian KRS telah ditutup.",
        },
        {
            syarat: "Bayar Biaya Pendidikan = Sudah Bayar",
            isi: STATUS_PEMBAYARAN_MAP[mahasiswa.status_pembayaran] ?? "Tidak Diketahui",
            boolean: mahasiswa.status_pembayaran === "LUNAS",
            pesanError: "Status pembayaran Anda belum lunas.",
        },
        {
            syarat: "Semester Mahasiswa = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14",
            isi: `${mahasiswa.semester_berjalan}`,
            boolean: isSemesterValid,
            pesanError: "Semester Anda tidak memenuhi syarat pengisian KRS.",
        },
        {
            syarat: "Status Mahasiswa = Aktif",
            isi: STATUS_MAHASISWA_MAP[mahasiswa.status_mahasiswa] ?? "Tidak Diketahui",
            boolean: mahasiswa.status_mahasiswa === "AKTIF",
            pesanError: "Status mahasiswa tidak aktif.",
        },
    ];
}

export async function getKrsAccess(userId: string, isAction = false) {
    const [periodeAktif, mahasiswa] = await Promise.all([
        prisma.periodeAkademik.findFirst({ where: { is_active: true } }),
        prisma.mahasiswa.findUnique({ where: { id_user: userId } }),
    ]);

    if (!periodeAktif) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Periode akademik aktif tidak ditemukan.',
        });
    }

    if (!mahasiswa) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Data mahasiswa tidak ditemukan.',
        });
    }

    const daftarSyarat = getSyaratKrsList(mahasiswa, periodeAktif);

    if (isAction) {
        const syaratGagal = daftarSyarat.find((item) => !item.boolean);
        if (syaratGagal) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: syaratGagal.pesanError,
            });
        }
    }

    return { periodeAktif, mahasiswa, daftarSyarat };
}