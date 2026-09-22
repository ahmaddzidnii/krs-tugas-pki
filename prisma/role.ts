import { prismaInstanceForSeeding } from "./seed";

const roles = [
    { nama_role: "MAHASISWA" },
    { nama_role: "DOSEN" },
];


export async function seedRole() {
    console.log('🚀 START: Seeding roles');

    await prismaInstanceForSeeding.role.createMany({
        data: roles.map((role) => ({
            ...role,
            created_at: Date.now(),
            updated_at: Date.now(),
        })),
        skipDuplicates: true,
    });

    console.log('✅ DONE: Seeding roles');
}