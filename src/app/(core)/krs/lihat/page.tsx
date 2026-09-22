"use client";

import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrapperKrs } from "@/components/wrapper-krs";
import { TabelInformasiUmum } from "@/components/table-informasi-umum";

const KRSLihatPage = () => {
  return (
    <WrapperKrs title="Data Isian KRS Terakhir">
      <div className="space-y-4">
        <Tabs defaultValue="informasiUmum">
          <TabsList>
            <TabsTrigger value="informasiUmum">Informasi Umum</TabsTrigger>
          </TabsList>

          <TabsContent value="informasiUmum">
            <TabelInformasiUmum {...informasiUmumMock} />
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="daftarKelasMataKuliah">
          <TabsList>
            <TabsTrigger value="daftarKelasMataKuliah">Daftar Kelas Mata Kuliah</TabsTrigger>
          </TabsList>

          <TabsContent value="daftarKelasMataKuliah">
            <DaftarKelasMataKuliah />
          </TabsContent>
        </Tabs>
      </div>
    </WrapperKrs>
  );
};

export default KRSLihatPage;

/* ---------------- MOCK DATA ---------------- */

const informasiUmumMock = {
  tahunAkademik: "2026/2027",
  semester: "Ganjil",
  ipk: "3.76",
  sksKumulatif: "126",
  ipsLalu: "3.63",
  jatahSks: "24",
  sksAmbil: "20",
  sisaSks: "4",
};

const kelasMock = [
  {
    id_kelas: "1",
    kode_kurikulum: "INF23102",
    kode_mata_kuliah: "IF6023",
    nama_mata_kuliah: "Pemrograman Platform Bergerak",
    sks: 3,
    nama_kelas: "A",
    jenis_mata_kuliah: "Wajib Program Studi",
    jadwal: [
      {
        hari: "Senin",
        waktu_mulai: "08:00",
        waktu_selesai: "10:30",
        ruangan: "Lab Mobile 1",
      },
    ],
    dosen_pengajar: [
      {
        nip_dosen: "19800101001",
        nama_dosen: "Dr. Budi Santoso, S.Kom., M.Kom.",
      },
    ],
  },
  {
    id_kelas: "2",
    kode_kurikulum: "INF23105",
    kode_mata_kuliah: "IF6045",
    nama_mata_kuliah: "Manajemen Basis Data & Query",
    sks: 3,
    nama_kelas: "B",
    jenis_mata_kuliah: "Wajib Program Studi",
    jadwal: [
      {
        hari: "Selasa",
        waktu_mulai: "13:00",
        waktu_selesai: "15:30",
        ruangan: "Ruang 2.3",
      },
    ],
    dosen_pengajar: [
      {
        nip_dosen: "19811212002",
        nama_dosen: "Siti Rahmawati, S.T., M.Cs.",
      },
    ],
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
      {
        hari: "Rabu",
        waktu_mulai: "09:40",
        waktu_selesai: "12:10",
        ruangan: "Lab Multimedia",
      },
      {
        hari: "Jumat",
        waktu_mulai: "07:30",
        waktu_selesai: "09:10",
        ruangan: "Lab Multimedia",
      },
    ],
    dosen_pengajar: [
      {
        nip_dosen: "19790515003",
        nama_dosen: "Ahmad Fajar, M.Kom.",
      },
      {
        nip_dosen: "19860321004",
        nama_dosen: "Rina Puspitasari, M.Cs.",
      },
    ],
  },
];

/* ---------------- TABLE ---------------- */

const JadwalCell = memo(
  ({
    jadwal,
  }: {
    jadwal: {
      hari: string;
      waktu_mulai: string;
      waktu_selesai: string;
      ruangan: string;
    }[];
  }) => (
    <>
      {jadwal.map((j, idx) => (
        <div
          key={idx}
          className="mb-5 last:mb-0"
        >
          <div>
            {j.hari}, {j.waktu_mulai} - {j.waktu_selesai}
          </div>
          <div className="text-xs text-gray-500">Ruang : {j.ruangan}</div>
        </div>
      ))}
    </>
  ),
);

const DosenCell = memo(
  ({
    dosenPengajar,
  }: {
    dosenPengajar: {
      nip_dosen: string;
      nama_dosen: string;
    }[];
  }) => (
    <>
      {dosenPengajar.map((d) => (
        <div
          key={d.nip_dosen}
          className="mb-5 last:mb-0"
        >
          {d.nama_dosen}
        </div>
      ))}
    </>
  ),
);

const TableHeader = memo(() => (
  <thead className="bg-gray-50">
    <tr>
      {["No.", "Mata Kuliah", "SKS", "Kelas", "Jenis", "Jadwal", "Dosen"].map((title) => (
        <th
          key={title}
          className="border border-gray-300 px-4 py-3 font-semibold text-gray-600"
        >
          {title}
        </th>
      ))}
    </tr>
  </thead>
));

const DaftarKelasMataKuliah = memo(() => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left text-sm text-gray-700">
      <TableHeader />

      <tbody>
        {kelasMock.map((k, idx) => (
          <tr
            key={k.id_kelas}
            className="hover:bg-gray-50"
          >
            <td className="border border-gray-300 px-4 py-3 text-center align-top">{idx + 1}</td>

            <td className="border border-gray-300 px-4 py-3 align-top">
              <div className="font-bold text-[#105E15]">{k.kode_kurikulum}</div>
              <div className="text-gray-500">{k.kode_mata_kuliah}</div>
              <div>{k.nama_mata_kuliah}</div>
            </td>

            <td className="border border-gray-300 px-4 py-3 text-center align-top">{k.sks}</td>

            <td className="border border-gray-300 px-4 py-3 text-center align-top">{k.nama_kelas}</td>

            <td className="border border-gray-300 px-4 py-3 align-top">{k.jenis_mata_kuliah}</td>

            <td className="border border-gray-300 px-4 py-3 align-top">
              <JadwalCell jadwal={k.jadwal} />
            </td>

            <td className="border border-gray-300 px-4 py-3 align-top">
              <DosenCell dosenPengajar={k.dosen_pengajar} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));
