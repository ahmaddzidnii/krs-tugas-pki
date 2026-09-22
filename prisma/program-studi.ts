import dataProdi from "./data/list-prodi.json";
import { JenjangStudi, Prisma, PrismaClient } from "../app/generated/prisma/client";
import { prismaInstanceForSeeding } from "./seed";


type ProdiJson = (typeof dataProdi)[number];

function toJenjangStudi(value: ProdiJson["JENJANG"]): JenjangStudi | null {
    switch (value) {
        case "Sarjana (S1)":
            return JenjangStudi.S1;
        case "Magister (S2)":
            return JenjangStudi.S2;
        case "Doktor (S3)":
            return JenjangStudi.S3;
        default:
            return null;
    }
}


async function getFacultyIds() {
    const facultyCodes = [...new Set(dataProdi.map((prodi) => prodi.KODE_FAKULTAS))];
    const faculties = await prismaInstanceForSeeding.fakultas.findMany({
        where: { kode_fakultas: { in: facultyCodes } },
        select: { id_fakultas: true, kode_fakultas: true },
    });

    return new Map(faculties.map((faculty) => [faculty.kode_fakultas, faculty.id_fakultas]));
}

function buildProgramStudiData(facultyIds: Map<string, string>, timestamp: number) {
    return dataProdi.flatMap((prodi) => {
        const idFakultas = facultyIds.get(prodi.KODE_FAKULTAS);
        const jenjangStudi = toJenjangStudi(prodi.JENJANG);

        if (!prodi.KODE_PRODI || !idFakultas || !jenjangStudi) {
            console.warn(
                `⚠️ Data prodi "${prodi.NAMA_PRODI}" dilewati karena kode fakultas, kode prodi, atau jenjang tidak valid.`,
            );
            return [];
        }

        return [
            {
                kode_prodi: String(prodi.KODE_PRODI),
                nama: prodi.NAMA_PRODI,
                jenjang_studi: jenjangStudi,
                id_fakultas: idFakultas,
                created_at: timestamp,
                updated_at: timestamp,
            },
        ];
    });
}



export async function seedProgramStudi() {
    const facultyIds = await getFacultyIds();
    const prodiData = buildProgramStudiData(facultyIds, Date.now());

    if (prodiData.length === 0) {
        console.log("🟡 Program Studi: tidak ada data valid untuk dibuat.");
        return;
    }

    const result = await prismaInstanceForSeeding.programStudi.createMany({
        data: prodiData,
        skipDuplicates: true,
    });

    console.log(`✅ Program Studi: ${result.count} data baru dibuat.`);
}