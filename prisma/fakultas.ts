import { Prisma } from "../src/generated/prisma/client";
import { prismaInstanceForSeeding } from "./seed";

const FAKULTAS_DATA = [
    { kode_fakultas: "F01", nama: "ADAB DAN ILMU BUDAYA", singkatan: "FADIB" },
    { kode_fakultas: "F02", nama: "DAKWAH DAN KOMUNIKASI", singkatan: "FD" },
    { kode_fakultas: "F03", nama: "EKONOMI DAN BISNIS ISLAM", singkatan: "FEBI" },
    { kode_fakultas: "F04", nama: "ILMU SOSIAL DAN HUMANIORA", singkatan: "FISHUM" },
    { kode_fakultas: "F05", nama: "ILMU TARBIYAH DAN KEGURUAN", singkatan: "TARBIYAH" },
    { kode_fakultas: "F06", nama: "SAINS DAN TEKNOLOGI", singkatan: "FST" },
    { kode_fakultas: "F07", nama: "SYARIAH DAN HUKUM", singkatan: "FSH" },
    { kode_fakultas: "F08", nama: "USHULUDDIN DAN PEMIKIRAN ISLAM", singkatan: "FUPI" },
    { kode_fakultas: "F09", nama: "PASCASARJANA", singkatan: "PASCA" },
    { kode_fakultas: "F10", nama: "Kedokteran dan Ilmu Kesehatan", singkatan: "FK" },
] satisfies Prisma.FakultasCreateInput[];

export async function seedFakultas() {
    const timestamp = Date.now();
    const result = await prismaInstanceForSeeding.fakultas.createMany({
        data: FAKULTAS_DATA.map((fakultas) => ({
            ...fakultas,
            created_at: timestamp,
            updated_at: timestamp,
        })),
        skipDuplicates: true,
    });

    console.log(`✅ Fakultas: ${result.count} data baru dibuat.`);
}