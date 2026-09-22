import React from "react";
import { RowTablePenawaranKelas, type BatchStatusResponse } from "./row-table-penawaran-kelas";

const daftarPenawaranKelas = {
  semester_paket: {
    6: [
      {
        id_kelas: "1",
        kode_kurikulum: "INF23102",
        kode_mata_kuliah: "IF6023",
        nama_mata_kuliah: "Pemrograman Platform Bergerak",
        jenis_mata_kuliah: "WAJIB",
        sks: 3,
        nama_kelas: "A",
        jadwal: [
          {
            hari: "Senin",
            waktu_mulai: "08:00",
            waktu_selesai: "10:30",
            ruangan: "Lab Mobile",
          },
        ],
        dosen_pengajar: [{ nip_dosen: "1", nama_dosen: "Dr. Budi Santoso" }],
      },
      {
        id_kelas: "2",
        kode_kurikulum: "INF23105",
        kode_mata_kuliah: "IF6045",
        nama_mata_kuliah: "Manajemen Basis Data & Query",
        jenis_mata_kuliah: "WAJIB",
        sks: 3,
        nama_kelas: "B",
        jadwal: [
          {
            hari: "Selasa",
            waktu_mulai: "13:00",
            waktu_selesai: "15:30",
            ruangan: "Ruang 2.3",
          },
        ],
        dosen_pengajar: [{ nip_dosen: "2", nama_dosen: "Siti Rahmawati" }],
      },
    ],
    7: [
      {
        id_kelas: "3",
        kode_kurikulum: "INF24101",
        kode_mata_kuliah: "IF7011",
        nama_mata_kuliah: "Machine Learning",
        jenis_mata_kuliah: "PILIHAN",
        sks: 3,
        nama_kelas: "A",
        jadwal: [
          {
            hari: "Kamis",
            waktu_mulai: "08:00",
            waktu_selesai: "10:30",
            ruangan: "Ruang AI",
          },
        ],
        dosen_pengajar: [{ nip_dosen: "3", nama_dosen: "Dr. Rina Puspitasari" }],
      },
    ],
  },
};

const statuses: BatchStatusResponse = {
  "1": { terisi: 20, kuota: 30, is_full: false, is_joined: true },
  "2": { terisi: 30, kuota: 30, is_full: true, is_joined: false },
  "3": { terisi: 12, kuota: 30, is_full: false, is_joined: false },
};

export const TabelPenawaranKelasBatch = () => {
  return (
    <table className="w-full border-collapse text-left text-sm text-gray-700">
      <thead className="bg-gray-50">
        <tr>
          {["No.", "Mata Kuliah", "SKS", "Kelas", "Jenis", "Jadwal", "Dosen", "Terisi / Kuota", "Aksi"].map((h) => (
            <th
              key={h}
              className="border border-gray-300 px-4 py-3 font-semibold"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {Object.entries(daftarPenawaranKelas.semester_paket).map(([semester, kelasList]) => (
          <React.Fragment key={semester}>
            <tr className="bg-gray-200">
              <td
                colSpan={9}
                className="border px-4 py-2 text-center font-bold"
              >
                SEMESTER PAKET {semester}
              </td>
            </tr>

            {kelasList.map((kelas, index) => (
              <RowTablePenawaranKelas
                key={kelas.id_kelas}
                kelas={kelas}
                index={index}
                statusKouta={statuses[kelas.id_kelas]}
              />
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};
