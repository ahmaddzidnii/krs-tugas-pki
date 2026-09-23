import { z } from 'zod';

import prisma from '@/lib/prisma';
import { formatJam } from '@/lib/utils';
import { TRPCError } from '@trpc/server';
import { getSyaratKrsList } from '@/lib/krs-rule';
import { hitungJatahSKS } from '@/lib/hitung-jatah-sks';

import { createTRPCRouter, krsActionProcedure, krsProcedure } from '../init';


export const krsRouter = createTRPCRouter({
    getInformasiUmum: krsProcedure.query(async ({ ctx }) => {
        const mahasiswa = ctx.mahasiswa;
        const periodeAktif = ctx.periodeAktif;

        const krs = await prisma.krs.findUnique({
            where: {
                id_mahasiswa_id_periode: {
                    id_mahasiswa: mahasiswa.id_mahasiswa,
                    id_periode: periodeAktif.id_periode,
                },
            },
            include: {
                detailKrs: {
                    include: {
                        kelas: {
                            include: {
                                mataKuliah: {
                                    select: { sks: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        const jatahSks = hitungJatahSKS(mahasiswa.ips_lalu);
        const sksAmbil =
            krs?.detailKrs.reduce(
                (total, item) => total + item.kelas.mataKuliah.sks,
                0
            ) ?? 0;

        const sisaSks = jatahSks - sksAmbil;

        return {
            tahun_akademik: periodeAktif.tahun_akademik,
            semester: periodeAktif.jenis_semester,
            ipk: mahasiswa.ipk.toFixed(2),
            sksKumulatif: mahasiswa.sks_kumulatif.toString(),
            ipsLalu: mahasiswa.ips_lalu.toFixed(2),
            jatahSks: jatahSks.toString(),
            sksAmbil: sksAmbil.toString(),
            sisaSks: sisaSks.toString(),
        };
    }),

    getSyaratKrs: krsProcedure.query(async ({ ctx }) => {
        return getSyaratKrsList(ctx.mahasiswa, ctx.periodeAktif);
    }),

    getPenawaranKelas: krsProcedure.query(async ({ ctx, }) => {
        const mahasiswa = ctx.mahasiswa;
        const periodeAktif = ctx.periodeAktif;

        const penawaran = await prisma.kelasDitawarkan.findMany({
            where: {
                id_periode: periodeAktif.id_periode,
                mataKuliah: {
                    detailKurikulum: {
                        some: {
                            id_kurikulum: mahasiswa.id_kurikulum,
                        },
                    },
                },
            },

            include: {
                mataKuliah: {
                    include: {
                        detailKurikulum: {
                            where: {
                                id_kurikulum: mahasiswa.id_kurikulum,
                            },
                            select: {
                                semester_paket: true,
                                jenis_matkul: true,
                                kurikulum: {
                                    select: {
                                        kode_kurikulum: true,
                                    },
                                },
                            },
                        },
                    },
                },

                jadwalKelas: {
                    orderBy: {
                        hari: "asc",
                    },
                },

                dosenPengajarKelas: {
                    include: {
                        dosen: {
                            select: {
                                id_dosen: true,
                                nip: true,
                                nama: true,
                            },
                        },
                    },
                },
            },

            orderBy: [
                {
                    mataKuliah: {
                        detailKurikulum: {
                            _count: "desc",
                        },
                    },
                },
                {
                    nama_kelas: "asc",
                },
            ],
        });

        const grouped = Object.groupBy(
            penawaran.map((kelas) => ({
                id_kelas: kelas.id_kelas,

                kode_kurikulum:
                    kelas.mataKuliah.detailKurikulum[0]?.kurikulum.kode_kurikulum,

                kode_mata_kuliah: kelas.mataKuliah.kode_matkul,
                nama_mata_kuliah: kelas.mataKuliah.nama,
                sks: kelas.mataKuliah.sks,

                semester_paket:
                    kelas.mataKuliah.detailKurikulum[0]?.semester_paket,

                jenis_mata_kuliah:
                    kelas.mataKuliah.detailKurikulum[0]?.jenis_matkul,

                nama_kelas: kelas.nama_kelas,

                jadwal: kelas.jadwalKelas.map((j) => ({
                    hari: j.hari,
                    waktu_mulai: formatJam(j.waktu_mulai),
                    waktu_selesai: formatJam(j.waktu_selesai),
                    ruangan: j.ruang,
                })),

                dosen_pengajar: kelas.dosenPengajarKelas.map((d) => ({
                    nip_dosen: d.dosen.nip,
                    nama_dosen: d.dosen.nama,
                })),
            })),
            (k) => k.semester_paket
        );

        return {
            semester_paket: grouped,
        };
    }),

    getStatusKuotaKelasBatch: krsProcedure.input(
        z.object({
            id_kelas: z.array(z.string()),
        })
    ).mutation(async ({ input, ctx }) => {

        const mahasiswa = ctx.mahasiswa;
        const periodAktif = ctx.periodeAktif;

        const statusKouta = await prisma.kelasDitawarkan.findMany({
            where: {
                id_kelas: {
                    in: input.id_kelas,
                },
            },
            select: {
                id_kelas: true,
                kuota: true,
                terisi: true,
            }
        })

        const joined = await prisma.detailKrs.findMany({
            where: {
                id_kelas: {
                    in: input.id_kelas,
                },
                krs: {
                    id_mahasiswa: mahasiswa.id_mahasiswa,
                    id_periode: periodAktif.id_periode,
                },
            },

            select: {
                id_kelas: true,
            },
        });

        const joinedSet = new Set(joined.map((j) => j.id_kelas));

        return Object.fromEntries(
            statusKouta.map((k) => [
                k.id_kelas,
                {
                    terisi: k.terisi,
                    kuota: k.kuota,
                    is_full: k.terisi >= k.kuota,
                    is_joined: joinedSet.has(k.id_kelas),
                },
            ])
        );
    }
    ),

    getDataKelasYangDiambil: krsProcedure.query(async ({ ctx }) => {

        const mahasiswa = ctx.mahasiswa;
        const periodeAktif = ctx.periodeAktif;

        const kelasDiambil = await prisma.detailKrs.findMany({
            where: {
                krs: {
                    id_mahasiswa: mahasiswa.id_mahasiswa,
                    id_periode: periodeAktif.id_periode,
                },
            },
            include: {
                kelas: {
                    include: {
                        mataKuliah: {
                            include: {
                                detailKurikulum: {
                                    where: {
                                        id_kurikulum: mahasiswa.id_kurikulum,
                                    },
                                    include: {
                                        kurikulum: true,
                                    },
                                },
                            },
                        },

                        jadwalKelas: true,

                        dosenPengajarKelas: {
                            include: {
                                dosen: {
                                    select: {
                                        id_dosen: true,
                                        nip: true,
                                        nama: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });


        return kelasDiambil.map((detail) => {
            const detailKurikulum = detail.kelas.mataKuliah.detailKurikulum[0];

            return {
                id_kelas: detail.kelas.id_kelas,

                kode_kurikulum: detailKurikulum.kurikulum.kode_kurikulum,

                kode_mata_kuliah: detail.kelas.mataKuliah.kode_matkul,
                nama_mata_kuliah: detail.kelas.mataKuliah.nama,
                sks: detail.kelas.mataKuliah.sks,

                nama_kelas: detail.kelas.nama_kelas,

                jenis_mata_kuliah: detailKurikulum.jenis_matkul,

                jadwal: detail.kelas.jadwalKelas.map((j) => ({
                    hari: j.hari,
                    waktu_mulai: formatJam(j.waktu_mulai),
                    waktu_selesai: formatJam(j.waktu_selesai),
                    ruangan: j.ruang,
                })),

                dosen_pengajar: detail.kelas.dosenPengajarKelas.map((d) => ({
                    nip_dosen: d.dosen.nip,
                    nama_dosen: d.dosen.nama,
                })),
            };
        });
    }),

    ambilKelas: krsActionProcedure
        .input(
            z.object({
                id_kelas: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const mahasiswa = ctx.mahasiswa;
            const periode = ctx.periodeAktif;

            return prisma.$transaction(async (tx) => {

                const kelas = await tx.kelasDitawarkan.findUnique({
                    where: {
                        id_kelas: input.id_kelas,
                    },
                    include: {
                        mataKuliah: true,
                        jadwalKelas: true,
                    },
                });

                if (!kelas) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "MAAF, DATA KELAS TIDAK DITEMUKAN.",
                    });
                }

                const namaKelasFormatted = `${kelas.mataKuliah.nama} - ${kelas.nama_kelas}`;

                if (kelas.terisi >= kelas.kuota) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `MAAF, KUOTA UNTUK KELAS {${namaKelasFormatted}} SUDAH PENUH.`,
                    });
                }

                const krs = await tx.krs.upsert({
                    where: {
                        id_mahasiswa_id_periode: {
                            id_mahasiswa: mahasiswa.id_mahasiswa,
                            id_periode: periode.id_periode,
                        },
                    },
                    create: {
                        id_mahasiswa: mahasiswa.id_mahasiswa,
                        id_periode: periode.id_periode,
                        total_sks_diambil: 0,
                        version: 1,
                    },
                    update: {},
                });

                const duplicate = await tx.detailKrs.findUnique({
                    where: {
                        id_krs_id_kelas: {
                            id_krs: krs.id_krs,
                            id_kelas: kelas.id_kelas,
                        },
                    },
                });

                if (duplicate) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: `MAAF, KELAS {${namaKelasFormatted}} SUDAH ADA DI KRS ANDA.`,
                    });
                }

                // Ambil kelas yang sudah diambil beserta mata kuliah & jadwal untuk deteksi bentrok
                const kelasDiambil = await tx.detailKrs.findMany({
                    where: {
                        id_krs: krs.id_krs,
                    },
                    include: {
                        kelas: {
                            include: {
                                mataKuliah: true,
                                jadwalKelas: true,
                            },
                        },
                    },
                });

                // Cek jadwal bentrok dan ambil nama kelas yang bersangkutan
                for (const detail of kelasDiambil) {
                    const kelasLama = detail.kelas;
                    const isBentrok = kelasLama.jadwalKelas.some((lama) =>
                        kelas.jadwalKelas.some((baru) => {
                            if (lama.hari !== baru.hari) return false;
                            return (
                                lama.waktu_mulai < baru.waktu_selesai &&
                                baru.waktu_mulai < lama.waktu_selesai
                            );
                        })
                    );

                    if (isBentrok) {
                        const namaKelasLamaFormatted = `${kelasLama.mataKuliah.nama} - ${kelasLama.nama_kelas}`;
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: `MAAF, JADWAL BENTROK DENGAN KELAS {${namaKelasLamaFormatted}}.`,
                        });
                    }
                }

                // Hitung total SKS langsung dari relasi kelasDiambil tanpa query ulang
                const totalSksSaatIni = kelasDiambil.reduce(
                    (sum, item) => sum + item.kelas.mataKuliah.sks,
                    0
                );

                const totalSksBaru = totalSksSaatIni + kelas.mataKuliah.sks;

                if (totalSksBaru > mahasiswa.jatah_sks) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `MAAF, PENAMBAHAN SKS AKAN MELEBIHI BATAS SKS ANDA. SKS SAAT INI: ${totalSksSaatIni}, JATAH SKS: ${mahasiswa.jatah_sks}`,
                    });
                }

                await tx.detailKrs.create({
                    data: {
                        id_krs: krs.id_krs,
                        id_kelas: kelas.id_kelas,
                    },
                });

                const result = await tx.kelasDitawarkan.updateMany({
                    where: {
                        id_kelas: kelas.id_kelas,
                        version: kelas.version,
                        terisi: {
                            lt: kelas.kuota,
                        },
                    },
                    data: {
                        terisi: {
                            increment: 1,
                        },
                        version: {
                            increment: 1,
                        },
                    },
                });

                if (result.count === 0) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "MAAF, KUOTA KELAS BARU SAJA PENUH ATAU DATA BERUBAH. SILAKAN COBA LAGI.",
                    });
                }

                await tx.krs.update({
                    where: {
                        id_krs: krs.id_krs,
                    },
                    data: {
                        total_sks_diambil: totalSksBaru,
                        version: {
                            increment: 1,
                        },
                    },
                });

                return {
                    ok: true,
                };
            });
        }),

    hapusKelas: krsActionProcedure
        .input(z.object({
            id_kelas: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {

            const mahasiswa = ctx.mahasiswa;
            const periode = ctx.periodeAktif;

            return prisma.$transaction(async (tx) => {
                const kelas = await tx.kelasDitawarkan.findUnique({
                    where: {
                        id_kelas: input.id_kelas,
                    },

                    include: {
                        mataKuliah: true,
                        jadwalKelas: true,
                    },
                });

                if (!kelas) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Kelas tidak ditemukan.",
                    });
                }

                if (mahasiswa.status_pembayaran !== "LUNAS") {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Status pembayaran belum lunas.",
                    });
                }

                if (mahasiswa.status_mahasiswa !== "AKTIF") {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Mahasiswa tidak dapat mengisi KRS.",
                    });
                }

                const krs = await tx.krs.findUniqueOrThrow({
                    where: {
                        id_mahasiswa_id_periode: {
                            id_mahasiswa: mahasiswa.id_mahasiswa,
                            id_periode: periode.id_periode,
                        },
                    },
                });

                const detail = await tx.detailKrs.findUniqueOrThrow({
                    where: {
                        id_krs_id_kelas: {
                            id_krs: krs.id_krs,
                            id_kelas: input.id_kelas,
                        },
                    },

                    include: {
                        kelas: {
                            include: {
                                mataKuliah: true,
                            },
                        },
                    },
                });

                await tx.detailKrs.delete({
                    where: {
                        id_krs_id_kelas: {
                            id_krs: krs.id_krs,
                            id_kelas: input.id_kelas,
                        },
                    },
                });

                await tx.kelasDitawarkan.update({
                    where: {
                        id_kelas: input.id_kelas,
                    },

                    data: {
                        terisi: {
                            decrement: 1,
                        },

                        version: {
                            increment: 1,
                        },
                    },
                });

                await tx.krs.update({
                    where: {
                        id_krs: krs.id_krs,
                    },

                    data: {
                        total_sks_diambil: {
                            decrement: detail.kelas.mataKuliah.sks,
                        },

                        version: {
                            increment: 1,
                        },
                    },
                });

                return {
                    ok: true,
                };
            });
        })
});

