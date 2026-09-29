import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { seedPeriodeAkademik } from "./seeders/periode-akademik";
import { seedFakultas } from "./seeders/fakultas";
import { seedProgramStudi } from "./seeders/program-studi";
import { seedRole } from "./seeders/role";
import { seedDosen } from "./seeders/dosen";
import { seedKurikulum } from "./seeders/kurikulum";
import { seedMataKuliah } from "./seeders/mata-kuliah";
import { seedDetailKurikulum } from "./seeders/detail-kurikulum";
import { seedMahasiswa } from "./seeders/mahasiswa";
import { seedKelasDitawarkan } from "./seeders/kelas";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

export const prismaInstanceForSeeding = new PrismaClient({ adapter });

// ======================================================
// Seeder Registry
// ======================================================

const seeders = {
    role: seedRole,
    fakultas: seedFakultas,
    "periode-akademik": seedPeriodeAkademik,
    "program-studi": seedProgramStudi,
    dosen: seedDosen,
    kurikulum: seedKurikulum,
    "mata-kuliah": seedMataKuliah,
    "detail-kurikulum": seedDetailKurikulum,
    mahasiswa: seedMahasiswa,
    kelas: seedKelasDitawarkan,
} as const;

type SeederName = keyof typeof seeders;

// ======================================================
// Seed Semua
// ======================================================

async function seedAll() {
    console.log("🚀 Memulai proses seeding semua data...");

    await seedRole();

    await Promise.all([
        seedFakultas(),
        seedPeriodeAkademik(),
        seedMataKuliah(),
    ]);

    await seedProgramStudi();

    await Promise.all([
        seedDosen(),
        seedKurikulum(),
    ]);

    await seedDetailKurikulum();

    await seedMahasiswa();

    await seedKelasDitawarkan();

    console.log("🏁 Semua seeding selesai.");
}

// ======================================================
// Main
// ======================================================

export async function main() {
    const target = process.argv[2];

    // Tidak ada argument → seed semuanya
    if (!target) {
        await seedAll();
        return;
    }

    // Validasi nama seeder
    if (!(target in seeders)) {
        console.error(`❌ Seeder "${target}" tidak ditemukan.`);

        console.log("\nSeeder yang tersedia:");
        Object.keys(seeders).forEach((name) => {
            console.log(`  - ${name}`);
        });

        process.exitCode = 1;
        return;
    }

    console.log(`🚀 Menjalankan seeder: ${target}`);

    const seeder = seeders[target as SeederName];

    await seeder();

    console.log(`🏁 Seeder "${target}" selesai.`);
}

main()
    .catch((error) => {
        console.error("❌ Seeding gagal.", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prismaInstanceForSeeding.$disconnect();
    });