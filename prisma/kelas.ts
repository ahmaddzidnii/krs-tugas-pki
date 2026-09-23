import { Hari, Prisma } from "@/generated/prisma/client";

import dataKelas from "../prisma/data/krs_penawaran.json";
import { prismaInstanceForSeeding } from "./seed";

export function timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
}

type KelasDitawarkan = Prisma.KelasDitawarkanCreateManyInput[];

export async function seedKelasDitawarkan() {
    try {
        // Unix Epoch Millisecond (13 digit)
        const timestamp = BigInt(Date.now());

        // Ambil periode akademik yang aktif
        const periodeAkademik =
            await prismaInstanceForSeeding.periodeAkademik.findFirst({
                where: { is_active: true },
                select: { id_periode: true },
            });

        if (!periodeAkademik) {
            throw new Error("Tidak ada periode akademik yang aktif");
        }

        // Ambil semua mata kuliah berdasarkan kode yang ada di data JSON
        const matakuliah = await prismaInstanceForSeeding.mataKuliah.findMany({
            where: {
                kode_matkul: {
                    in: dataKelas.map((kelas) => kelas.kode_matkul),
                },
            },
            select: {
                id_matkul: true,
                kode_matkul: true,
            },
        });

        // Map kode matkul -> id matkul
        const matakuliahMap = new Map(
            matakuliah.map((mk) => [mk.kode_matkul, mk.id_matkul]),
        );

        // =========================
        // KELAS DITAWARKAN
        // =========================
        const kelasDitawarkanData: KelasDitawarkan = dataKelas.map((kelas) => {
            const idMatkul = matakuliahMap.get(kelas.kode_matkul);

            if (!idMatkul) {
                throw new Error(
                    `Mata kuliah dengan kode ${kelas.kode_matkul} tidak ditemukan`,
                );
            }

            return {
                id_matkul: idMatkul,
                id_periode: periodeAkademik.id_periode,
                nama_kelas: kelas.nama_kelas,
                kuota: kelas.kouta,
                created_at: timestamp,
                updated_at: timestamp,
            };
        });

        const insertedKelas =
            await prismaInstanceForSeeding.kelasDitawarkan.createMany({
                data: kelasDitawarkanData,
                skipDuplicates: true,
            });

        console.log(`Berhasil membuat ${insertedKelas.count} kelas ditawarkan`);

        // Ambil kelas yang sudah dibuat untuk mendapatkan ID
        const createdKelas = await prismaInstanceForSeeding.kelasDitawarkan.findMany({
            where: {
                id_periode: periodeAkademik.id_periode,
                id_matkul: {
                    in: Array.from(matakuliahMap.values()),
                },
            },
            include: {
                mataKuliah: {
                    select: {
                        kode_matkul: true,
                    },
                },
            },
        });

        // Map kode matkul + nama kelas -> id kelas
        const kelasMap = new Map(
            createdKelas.map((kelas) => [
                `${kelas.mataKuliah.kode_matkul}-${kelas.nama_kelas}`,
                kelas.id_kelas,
            ]),
        );

        // =========================
        // JADWAL KELAS
        // =========================
        const jadwalKelasData: Prisma.JadwalKelasCreateManyInput[] = [];

        dataKelas.forEach((kelas) => {
            const idKelas = kelasMap.get(`${kelas.kode_matkul}-${kelas.nama_kelas}`);

            if (!idKelas) {
                console.warn(
                    `Kelas ${kelas.kode_matkul}-${kelas.nama_kelas} tidak ditemukan`,
                );
                return;
            }

            kelas.jadwal.forEach((jadwal) => {
                jadwalKelasData.push({
                    hari: getValueHari(jadwal.hari),
                    waktu_mulai: timeStringToMinutes(jadwal.jam_mulai),
                    waktu_selesai: timeStringToMinutes(jadwal.jam_selesai),
                    ruang: jadwal.ruang,
                    id_kelas: idKelas,
                    created_at: timestamp,
                    updated_at: timestamp,
                });
            });
        });

        const insertedJadwal =
            await prismaInstanceForSeeding.jadwalKelas.createMany({
                data: jadwalKelasData,
                skipDuplicates: true,
            });

        console.log(`Berhasil membuat ${insertedJadwal.count} jadwal kelas`);

        // =========================
        // DOSEN PENGAJAR KELAS
        // =========================
        const allNamaDosen = dataKelas.flatMap((kelas) =>
            kelas.dosen.map((dosen) => dosen.nama),
        );

        const dosen = await prismaInstanceForSeeding.dosen.findMany({
            where: {
                nama: {
                    in: allNamaDosen,
                },
            },
            select: {
                id_dosen: true,
                nama: true,
            },
        });

        const dosenMap = new Map(dosen.map((d) => [d.nama, d.id_dosen]));

        const dosenPengajarData: Prisma.DosenPengajarKelasCreateManyInput[] = [];

        dataKelas.forEach((kelas) => {
            const idKelas = kelasMap.get(`${kelas.kode_matkul}-${kelas.nama_kelas}`);

            if (!idKelas) return;

            kelas.dosen.forEach((dosenData) => {
                const idDosen = dosenMap.get(dosenData.nama);

                if (!idDosen) {
                    console.warn(`Dosen dengan nama ${dosenData.nama} tidak ditemukan`);
                    return;
                }

                dosenPengajarData.push({
                    id_dosen: idDosen,
                    id_kelas: idKelas,

                });
            });
        });

        const insertedDosenPengajar =
            await prismaInstanceForSeeding.dosenPengajarKelas.createMany({
                data: dosenPengajarData,
                skipDuplicates: true,
            });

        console.log(
            `Berhasil membuat ${insertedDosenPengajar.count} relasi dosen pengajar`,
        );

        console.log("Seeding kelas ditawarkan selesai!");
    } catch (error) {
        console.error("Error dalam seeding kelas ditawarkan:", error);
        throw error;
    }
}

function getValueHari(hari: string): Hari {
    switch (hari.toUpperCase()) {
        case "SENIN":
            return Hari.Senin;
        case "SELASA":
            return Hari.Selasa;
        case "RABU":
            return Hari.Rabu;
        case "KAMIS":
            return Hari.Kamis;
        case "JUMAT":
            return Hari.Jumat;
        case "SABTU":
            return Hari.Sabtu;
        case "MINGGU":
            return Hari.Minggu;
        default:
            throw new Error(`Hari tidak valid: ${hari}`);
    }
}