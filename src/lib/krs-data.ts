export interface JadwalKuliah {
    hari: string;
    waktu_mulai: string;
    waktu_selesai: string;
    ruangan: string;
}

export interface DosenPengajar {
    nip_dosen: string;
    nama_dosen: string;
}

export interface KelasKuliah {
    id_kelas: string;
    kode_kurikulum: string;
    kode_mata_kuliah: string;
    nama_mata_kuliah: string;
    sks: number;
    nama_kelas: string;
    jenis_mata_kuliah: string;
    jadwal: JadwalKuliah[];
    dosen_pengajar: DosenPengajar[];
}

export const informasiUmumMock = {
    tahunAkademik: "2026/2027",
    semester: "Ganjil",
    ipk: "3.76",
    sksKumulatif: "126",
    ipsLalu: "3.63",
    jatahSks: "24",
    sksAmbil: "20",
    sisaSks: "4",
};

export const kelasMock: KelasKuliah[] = [
    {
        id_kelas: "1",
        kode_kurikulum: "INF23102",
        kode_mata_kuliah: "IF6023",
        nama_mata_kuliah: "Pemrograman Platform Bergerak",
        sks: 3,
        nama_kelas: "A",
        jenis_mata_kuliah: "Wajib Program Studi",
        jadwal: [{ hari: "Senin", waktu_mulai: "08:00", waktu_selesai: "10:30", ruangan: "Lab Mobile 1" }],
        dosen_pengajar: [{ nip_dosen: "19800101001", nama_dosen: "Dr. Budi Santoso, S.Kom., M.Kom." }],
    },
    {
        id_kelas: "2",
        kode_kurikulum: "INF23105",
        kode_mata_kuliah: "IF6045",
        nama_mata_kuliah: "Manajemen Basis Data & Query",
        sks: 3,
        nama_kelas: "B",
        jenis_mata_kuliah: "Wajib Program Studi",
        jadwal: [{ hari: "Selasa", waktu_mulai: "13:00", waktu_selesai: "15:30", ruangan: "Ruang 2.3" }],
        dosen_pengajar: [{ nip_dosen: "19811212002", nama_dosen: "Siti Rahmawati, S.T., M.Cs." }],
    },
    {
        id_kelas: "3",
        kode_kurikulum: "INF23108",
        kode_mata_kuliah: "IF6067",
        nama_mata_kuliah: "Pemrograman Game",
        sks: 3,
        nama_kelas: "A",
        jenis_mata_kuliah: "Pilihan Program Studi",
        jadwal: [
            { hari: "Rabu", waktu_mulai: "09:40", waktu_selesai: "12:10", ruangan: "Lab Multimedia" },
            { hari: "Jumat", waktu_mulai: "07:30", waktu_selesai: "09:10", ruangan: "Lab Multimedia" },
        ],
        dosen_pengajar: [
            { nip_dosen: "19790515003", nama_dosen: "Ahmad Fajar, M.Kom." },
            { nip_dosen: "19860321004", nama_dosen: "Rina Puspitasari, M.Cs." },
        ],
    },
];
