import * as bcrypt from 'bcryptjs';
import {
    Prisma,
    StatusMahasiswa,
    StatusPembayaran,
} from '../app/generated/prisma/client';
import dataMhs from '../prisma/data/angkatan-2023.json';
import { prismaInstanceForSeeding } from './seed';

const CHUNK_SIZE = 250;
const HASH_ROUNDS = 10;

export const seedMahasiswa = async () => {
    console.log('🚀 START: Seeding data Mahasiswa...');

    try {
        // ==============================
        // 1. Ambil role MAHASISWA
        // ==============================
        const role = await prismaInstanceForSeeding.role.findFirst({
            where: { nama_role: 'MAHASISWA' },
            select: { id_role: true },
        });

        if (!role) {
            throw new Error('❌ Role MAHASISWA tidak ditemukan.');
        }

        // ==============================
        // 2. Seed User Mahasiswa (Chunking)
        // ==============================
        console.log('👤 Seeding user mahasiswa...');

        for (let i = 0; i < dataMhs.length; i += CHUNK_SIZE) {
            const chunk = dataMhs.slice(i, i + CHUNK_SIZE);

            const usersToCreate = await Promise.all(
                chunk.map(async (mhs) => {
                    const now = BigInt(Date.now());

                    return {
                        username: String(mhs.NIM),
                        password: await bcrypt.hash(String(mhs.PASSWORD), HASH_ROUNDS),
                        id_role: role.id_role,
                        created_at: now,
                        updated_at: now,
                    };
                }),
            );

            await prismaInstanceForSeeding.user.createMany({
                data: usersToCreate,
                skipDuplicates: true,
            });

            console.log(
                `   ✅ User batch ${Math.floor(i / CHUNK_SIZE) + 1} (${Math.min(i + CHUNK_SIZE, dataMhs.length)}/${dataMhs.length})`,
            );
        }

        // ==============================
        // 3. Ambil semua relasi
        // ==============================
        const [userIds, prodiIds, dpaIds, kurikulumIds] = await Promise.all([
            prismaInstanceForSeeding.user.findMany({
                where: {
                    username: {
                        in: dataMhs.map((mhs) => String(mhs.NIM)),
                    },
                },
                select: {
                    id_user: true,
                    username: true,
                },
            }),

            prismaInstanceForSeeding.programStudi.findMany({
                where: {
                    kode_prodi: {
                        in: dataMhs.map((mhs) => String(mhs.KODE_PRODI)),
                    },
                },
                select: {
                    id_prodi: true,
                    kode_prodi: true,
                },
            }),

            prismaInstanceForSeeding.dosen.findMany({
                where: {
                    nip: {
                        in: dataMhs.map((mhs) => String(mhs.NIP_DPA)),
                    },
                },
                select: {
                    id_dosen: true,
                    nip: true,
                },
            }),

            prismaInstanceForSeeding.kurikulum.findMany({
                where: {
                    kode_kurikulum: {
                        in: dataMhs.map((mhs) => String(mhs.KODE_KURIKULUM)),
                    },
                },
                select: {
                    id_kurikulum: true,
                    kode_kurikulum: true,
                },
            }),
        ]);

        // ==============================
        // 4. Map lookup O(1)
        // ==============================
        const userMap = new Map(userIds.map((u) => [u.username, u.id_user]));
        const prodiMap = new Map(prodiIds.map((p) => [p.kode_prodi, p.id_prodi]));
        const dpaMap = new Map(dpaIds.map((d) => [d.nip, d.id_dosen]));
        const kurikulumMap = new Map(
            kurikulumIds.map((k) => [k.kode_kurikulum, k.id_kurikulum]),
        );

        // ==============================
        // 5. Siapkan data mahasiswa
        // ==============================
        const skipped: string[] = [];
        const now = BigInt(Date.now());

        const mahasiswaToCreate = dataMhs.reduce(
            (acc: Prisma.MahasiswaCreateManyInput[], mhs) => {
                const id_user = userMap.get(String(mhs.NIM));
                const id_prodi = prodiMap.get(String(mhs.KODE_PRODI));
                const id_dpa = dpaMap.get(String(mhs.NIP_DPA));
                const id_kurikulum = kurikulumMap.get(String(mhs.KODE_KURIKULUM));

                if (!id_user || !id_prodi || !id_dpa || !id_kurikulum) {
                    skipped.push(String(mhs.NIM));
                    return acc;
                }

                acc.push({
                    id_user,
                    id_prodi,
                    id_dpa,
                    id_kurikulum,
                    nim: String(mhs.NIM),
                    nama: String(mhs.FORMATED_NAMA),
                    ipk: 4.0,
                    ips_lalu: 4.0,
                    semester_berjalan: 5,
                    sks_kumulatif: 88,
                    jatah_sks: 24,
                    status_mahasiswa: StatusMahasiswa.AKTIF,
                    status_pembayaran: StatusPembayaran.LUNAS,
                    created_at: now,
                    updated_at: now,
                });

                return acc;
            },
            [],
        );

        if (mahasiswaToCreate.length === 0) {
            console.log('🟡 INFO: Tidak ada data mahasiswa baru untuk di-seed.');
            return;
        }

        // ==============================
        // 6. Insert Mahasiswa (Chunking)
        // ==============================
        console.log('🎓 Seeding data mahasiswa...');

        let inserted = 0;

        for (let i = 0; i < mahasiswaToCreate.length; i += CHUNK_SIZE) {
            const chunk = mahasiswaToCreate.slice(i, i + CHUNK_SIZE);

            const result = await prismaInstanceForSeeding.mahasiswa.createMany({
                data: chunk,
                skipDuplicates: true,
            });

            inserted += result.count;

            console.log(
                `   ✅ Mahasiswa batch ${Math.floor(i / CHUNK_SIZE) + 1} (${inserted}/${mahasiswaToCreate.length})`,
            );
        }

        // ==============================
        // 7. Summary
        // ==============================
        console.log(`✅ SUCCESS: ${inserted} data mahasiswa berhasil di-seed.`);

        if (skipped.length > 0) {
            console.log(
                `⚠️ SKIPPED: ${skipped.length} mahasiswa dilewati karena relasi tidak lengkap.`,
            );
        }
    } catch (error) {
        console.error('❌ ERROR: Gagal seeding Mahasiswa.', error);
    } finally {
        console.log('🏁 END: Proses seeding Mahasiswa selesai.');
    }
};