import { Prisma } from '../app/generated/prisma/client';
import kurikulumjson from '../prisma/data/kurikulum_master.json';
import { prismaInstanceForSeeding } from './seed';

export const seedKurikulum = async () => {
    console.log('🚀 START: Seeding data kurikulum...');

    try {
        // Ambil semua prodi yang dibutuhkan
        const prodiIds = await prismaInstanceForSeeding.programStudi.findMany({
            where: {
                kode_prodi: {
                    in: kurikulumjson.map((k) => String(k.kode_prodi)),
                },
            },
            select: {
                id_prodi: true,
                kode_prodi: true,
            },
        });

        // Lookup O(1)
        const prodiMap = new Map(
            prodiIds.map((p) => [p.kode_prodi, p.id_prodi]),
        );

        const skipped: string[] = [];
        const now = BigInt(Date.now());

        const kurikulums = kurikulumjson.reduce(
            (acc: Prisma.KurikulumCreateManyInput[], kurikulum) => {
                const id_prodi = prodiMap.get(String(kurikulum.kode_prodi));

                if (!id_prodi) {
                    skipped.push(kurikulum.kode_kurikulum);
                    return acc;
                }

                acc.push({
                    kode_kurikulum: kurikulum.kode_kurikulum,
                    nama: kurikulum.nama_kurikulum,
                    id_prodi,
                    is_active: false,
                    // is_active: kurikulum.tahun === 2024,
                    created_at: now,
                    updated_at: now,
                });

                return acc;
            },
            [],
        );

        if (kurikulums.length === 0) {
            console.log(
                '🟡 INFO: Tidak ada data kurikulum baru yang valid untuk dimasukkan.',
            );
            return;
        }

        await prismaInstanceForSeeding.kurikulum.createMany({
            data: kurikulums,
            skipDuplicates: true,
        });

        console.log(`✅ SUCCESS: ${kurikulums.length} data kurikulum berhasil di-seed.`);

        if (skipped.length > 0) {
            console.log(
                `⚠️ SKIPPED: ${skipped.length} kurikulum dilewati karena program studi tidak ditemukan.`,
            );
        }
    } catch (error) {
        console.error('❌ ERROR: Terjadi kegagalan saat seeding.', error);
    } finally {
        console.log('🏁 END: Proses seeding kurikulum selesai.');
    }
};
