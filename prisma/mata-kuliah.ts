
import matakuliahJson from '../prisma/data/matakuliah_master.json';
import { prismaInstanceForSeeding } from './seed';

export const seedMataKuliah = async () => {
    console.log('🚀 START: Seeding data Mata Kuliah...');

    try {
        const matakuliahs = matakuliahJson.map((m) => ({
            kode_matkul: m.kode_matkul,
            nama: m.nama_matkul,
            sks: m.sks,
        }));

        const result = await prismaInstanceForSeeding.mataKuliah.createMany({
            data: matakuliahs.map((m) => ({
                ...m,
                created_at: BigInt(Date.now()),
                updated_at: BigInt(Date.now()),
            })),
            skipDuplicates: true,
        });

        console.log(
            `✅ SUCCESS: Berhasil menambahkan ${result.count} mata kuliah baru.`,
        );
    } catch (error) {
        console.error(
            '❌ ERROR: Terjadi kegagalan saat seeding mata kuliah.',
            error,
        );
    } finally {
        console.log('🏁 END: Proses seeding Mata Kuliah selesai.');
    }
};