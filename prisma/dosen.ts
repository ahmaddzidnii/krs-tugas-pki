import * as bcrypt from 'bcryptjs';
import { Prisma, JenisDosen } from '../app/generated/prisma/client';
import dosenData from './data/gabungan_dosen.json';
import { prismaInstanceForSeeding } from './seed';

const CHUNK_SIZE = 250;
const HASH_ROUNDS = 10;

export const seedDosen = async () => {
    console.log('🚀 START: Seeding data dosen');

    // ==============================
    // 1. Ambil role DOSEN
    // ==============================
    const role = await prismaInstanceForSeeding.role.findFirst({
        where: { nama_role: 'DOSEN' },
        select: { id_role: true },
    });

    if (!role) throw new Error('❌ Role DOSEN tidak ditemukan.');

    // ==============================
    // 2. Seed User Dosen (Chunking)
    // ==============================
    console.log('👤 Seeding user dosen...');

    for (let i = 0; i < dosenData.data.length; i += CHUNK_SIZE) {
        const chunk = dosenData.data.slice(i, i + CHUNK_SIZE);

        const usersToCreate = await Promise.all(
            chunk.map(async (d) => {
                const now = BigInt(Date.now());

                return {
                    username: String(d.nip),
                    password: await bcrypt.hash(String(d.default_password), HASH_ROUNDS),
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
            `   ✅ User batch ${Math.floor(i / CHUNK_SIZE) + 1} (${Math.min(i + CHUNK_SIZE, dosenData.data.length)}/${dosenData.data.length})`,
        );
    }

    // ==============================
    // 3. Ambil mapping user & prodi
    // ==============================
    const [userIds, prodiIds] = await Promise.all([
        prismaInstanceForSeeding.user.findMany({
            where: {
                username: {
                    in: dosenData.data.map((d) => String(d.nip)),
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
                    in: dosenData.data.map((d) => String(d.kode_prodi)),
                },
            },
            select: {
                id_prodi: true,
                kode_prodi: true,
            },
        }),
    ]);

    const userMap = new Map(userIds.map((u) => [u.username, u.id_user]));
    const prodiMap = new Map(prodiIds.map((p) => [p.kode_prodi, p.id_prodi]));

    // ==============================
    // 4. Helper enum
    // ==============================
    const getIdJenisDosen = (nama: string): JenisDosen => {
        switch (nama) {
            case 'Dosen Tetap PNS':
                return JenisDosen.DOSEN_TETAP_PNS;

            case 'Dosen Tetap Bukan PNS':
                return JenisDosen.DOSEN_TETAP_BUKAN_PNS;

            default:
                return JenisDosen.DOSEN_LUAR_BIASA;
        }
    };

    // ==============================
    // 5. Siapkan data dosen
    // ==============================
    const skipped: string[] = [];

    const dosenToCreate = dosenData.data.reduce(
        (acc: Prisma.DosenCreateManyInput[], d) => {
            const id_user = userMap.get(String(d.nip));
            const id_prodi = prodiMap.get(String(d.kode_prodi));

            if (!id_user || !id_prodi) {
                skipped.push(String(d.nip));
                return acc;
            }

            const now = BigInt(Date.now());

            acc.push({
                nip: String(d.nip),
                id_user,
                nama: String(d.nama_dosen),
                id_prodi,
                aktif_mengajar: d.aktif_mengajar,
                jenis_dosen: getIdJenisDosen(d.jenis_dosen),
                created_at: now,
                updated_at: now,
            });

            return acc;
        },
        [],
    );

    // ==============================
    // 6. Insert Dosen (Chunking)
    // ==============================
    console.log('🎓 Seeding data dosen...');

    let inserted = 0;

    for (let i = 0; i < dosenToCreate.length; i += CHUNK_SIZE) {
        const chunk = dosenToCreate.slice(i, i + CHUNK_SIZE);

        await prismaInstanceForSeeding.dosen.createMany({
            data: chunk,
            skipDuplicates: true,
        });

        inserted += chunk.length;

        console.log(
            `   ✅ Dosen batch ${Math.floor(i / CHUNK_SIZE) + 1} (${inserted}/${dosenToCreate.length})`,
        );
    }

    // ==============================
    // 7. Summary
    // ==============================
    console.log(`✅ SUCCESS: ${inserted} data dosen berhasil di-seed.`);

    if (skipped.length > 0) {
        console.log(`⚠️ SKIPPED: ${skipped.length} dosen dilewati karena relasi tidak lengkap.`);
    }
};