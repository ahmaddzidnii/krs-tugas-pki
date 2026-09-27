import { z } from "zod";
import { tool } from "@langchain/core/tools";

import prisma from "@/lib/prisma";


export const GET_OFFERED_COURSES = tool(
    async (_, config) => {
        const session = config.configurable?.session as Awaited<ReturnType<typeof import("@/lib/auth").getServerSideSession>> | undefined;

        if (!session) {
            return {
                status: "UNAUTHORIZED",
                message: "Mahasiswa belum login.",
            };
        }

        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: {
                id_user: session.user.id,
            },
            select: {
                id_kurikulum: true,
            },
        });

        if (!mahasiswa) {
            return {
                status: "STUDENT_NOT_FOUND",
                message: "Data mahasiswa tidak ditemukan.",
            };
        }

        const periodeAktif = await prisma.periodeAkademik.findFirst({
            where: {
                is_active: true,
            },
            select: {
                id_periode: true,
                tahun_akademik: true,
                jenis_semester: true,
            },
        });

        if (!periodeAktif) {
            return {
                status: "NO_ACTIVE_PERIOD",
                message: "Tidak ada periode akademik aktif.",
            };
        }

        const detailKurikulum =
            await prisma.detailKurikulum.findMany({
                where: {
                    id_kurikulum: mahasiswa.id_kurikulum,
                },
                select: {
                    semester_paket: true,
                    jenis_matkul: true,

                    mataKuliah: {
                        select: {
                            id_matkul: true,
                            kode_matkul: true,
                            nama: true,
                            sks: true,

                            kelasDitawarkan: {
                                where: {
                                    id_periode:
                                        periodeAktif.id_periode,
                                },
                                select: {
                                    id_kelas: true,
                                    nama_kelas: true,
                                    kuota: true,
                                    terisi: true,

                                    jadwalKelas: {
                                        select: {
                                            hari: true,
                                            waktu_mulai: true,
                                            waktu_selesai: true,
                                            ruang: true,
                                        },
                                    },

                                    dosenPengajarKelas: {
                                        select: {
                                            dosen: {
                                                select: {
                                                    nip: true,
                                                    nama: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    semester_paket: "asc",
                },
            });

        const courses = detailKurikulum.flatMap((detail) =>
            detail.mataKuliah.kelasDitawarkan.map((kelas) => ({
                id_kelas: kelas.id_kelas,

                mata_kuliah: {
                    kode: detail.mataKuliah.kode_matkul,
                    nama: detail.mataKuliah.nama,
                    sks: detail.mataKuliah.sks,
                    jenis: detail.jenis_matkul,
                    semester_paket: detail.semester_paket,
                },

                kelas: kelas.nama_kelas,

                kuota: {
                    kapasitas: kelas.kuota,
                    terisi: kelas.terisi,
                    tersedia: Math.max(
                        0,
                        kelas.kuota - kelas.terisi,
                    ),
                },

                jadwal: kelas.jadwalKelas,

                dosen: kelas.dosenPengajarKelas.map(
                    ({ dosen }) => ({
                        nip: dosen.nip,
                        nama: dosen.nama,
                    }),
                ),
            })),
        );

        if (courses.length === 0) {
            return {
                status: "NO_OFFERING_FOUND",
                periode: {
                    tahun_akademik:
                        periodeAktif.tahun_akademik,
                    semester: periodeAktif.jenis_semester,
                },
                courses: [],
                message:
                    "Tidak ditemukan kelas yang tersedia dalam penawaran KRS mahasiswa pada periode aktif.",
            };
        }

        return {
            status: "SUCCESS",
            periode: {
                tahun_akademik:
                    periodeAktif.tahun_akademik,
                semester: periodeAktif.jenis_semester,
            },
            courses,
        };
    },
    {
        name: "GET_OFFERED_COURSES",
        description: `
Mengambil daftar kelas yang tersedia untuk mahasiswa yang sedang
login berdasarkan kurikulum mahasiswa dan periode akademik aktif.

Gunakan tool ini ketika mahasiswa ingin melihat, mencari, memilih,
atau mengambil kelas.

Hasil tool ini merupakan sumber kebenaran untuk ketersediaan kelas
dalam proses KRS mahasiswa.

Jika status NO_OFFERING_FOUND atau mata kuliah yang diminta tidak
terdapat dalam courses, informasikan bahwa mata kuliah tersebut
tidak ditemukan dalam penawaran KRS mahasiswa saat ini.

Jangan menyimpulkan alasan spesifik mengapa mata kuliah tidak
tersedia.
        `.trim(),
        schema: z.object({}),
    },
);