import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { seedPeriodeAkademik } from "./periode-akademik";
import { seedFakultas } from "./fakultas";
import { seedProgramStudi } from "./program-studi";
import { seedRole } from "./role";
import { seedDosen } from "./dosen";
import { seedKurikulum } from "./kurikulum";
import { seedMataKuliah } from "./mata-kuliah";
import { seedDetailKurikulum } from "./detail-kurikulum";
import { seedMahasiswa } from "./mahasiswa";
import { seedKelasDitawarkan } from "./kelas";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

export const prismaInstanceForSeeding = new PrismaClient({ adapter });





export async function main() {
    console.log("🚀 Memulai proses seeding...");

    // 1. Paling dasar (tidak punya dependency)
    await seedRole();

    await Promise.all([
        seedFakultas(),
        seedPeriodeAkademik(),
        seedMataKuliah(), // mata kuliah tidak bergantung apa pun
    ]);

    // 2. Bergantung ke Fakultas
    await seedProgramStudi();

    // 3. Bergantung ke Program Studi
    await Promise.all([
        seedDosen(),      // bikin User DOSEN + Dosen
        seedKurikulum(),  // bergantung ke Program Studi
    ]);

    // 4. Bergantung ke Kurikulum + Mata Kuliah
    await seedDetailKurikulum();

    // 5. Bergantung ke Dosen + Kurikulum + Program Studi
    await seedMahasiswa(); // bikin User MAHASISWA + Mahasiswa

    await seedKelasDitawarkan(); // bikin Kelas Ditawarkan + Dosen Pengajar Kelas + KRS + Detail KRS

    console.log("🏁 Seeding selesai.");
}

main()
    .catch((error) => {
        console.error("❌ Seeding gagal.", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaInstanceForSeeding.$disconnect();
    });
