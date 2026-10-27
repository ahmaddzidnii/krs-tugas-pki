import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { caller } from "@/trpc/server";

export const GET_CURRENT_KRS_STATUS = tool(
    async () => {
        const [infoAkademik, kelasDiambil] = await Promise.all([
            caller.krs.getInformasiUmum(),
            caller.krs.getDataKelasYangDiambil(),
        ]);

        return {
            status: "SUCCESS",
            ringkasan_akademik: {
                ipk: infoAkademik.ipk,
                ips_terakhir: infoAkademik.ipsLalu,
                jatah_sks: infoAkademik.jatahSks,
                sks_terpakai: infoAkademik.sksAmbil,
                sisa_sks: infoAkademik.sisaSks,
            },
            kelas_diambil: kelasDiambil,
        };
    },
    {
        name: "GET_CURRENT_KRS_STATUS",
        description: `
Mengambil kondisi lengkap KRS mahasiswa pada periode akademik aktif saat ini.
Mengembalikan:
1. Ringkasan akademik: IPK, IPS terakhir, batas/jatah SKS, total SKS yang sudah diambil, dan sisa jatah SKS.
2. Daftar seluruh mata kuliah/kelas yang sudah berhasil diambil beserta jadwal dan SKS-nya.

Gunakan tool ini ketika mahasiswa menanyakan status KRS mereka saat ini, mengecek jadwal kuliah mereka, atau ingin tahu apakah sisa SKS mereka masih mencukupi sebelum menambah kelas baru.
        `.trim(),
        schema: z.object({}),
    }
);