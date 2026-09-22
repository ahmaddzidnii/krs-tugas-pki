import { FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const dataKrs = [
  {
    id_kelas: "1",
    kode_kurikulum: "INF23102",
    kode_mata_kuliah: "IF6023",
    nama_mata_kuliah: "Pemrograman Platform Bergerak",
    sks: 3,
    nama_kelas: "A",
    jenis_mata_kuliah: "Wajib",
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
    sks: 3,
    nama_kelas: "B",
    jenis_mata_kuliah: "Wajib",
    jadwal: [
      {
        hari: "Selasa",
        waktu_mulai: "13:00",
        waktu_selesai: "15:30",
        ruangan: "Ruang 2.3",
      },
    ],
    dosen_pengajar: [{ nip_dosen: "2", nama_dosen: "Siti Rahmawati, M.Cs." }],
  },
];

export const DataKrsSection = () => {
  return (
    <div className="w-full max-w-7xl rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              {["No.", "Mata Kuliah", "SKS", "Kelas", "Jenis", "Jadwal", "Dosen", "Aksi"].map((item) => (
                <th
                  key={item}
                  className="border border-gray-300 px-4 py-3 font-semibold text-gray-600"
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dataKrs.map((k, idx) => (
              <tr
                key={k.id_kelas}
                className="hover:bg-gray-50"
              >
                <td className="border px-4 py-3 text-center align-top">{idx + 1}</td>

                <td className="border px-4 py-3 align-top">
                  <div className="font-bold text-[#105E15]">{k.kode_kurikulum}</div>
                  <div className="text-gray-500">{k.kode_mata_kuliah}</div>
                  <div>{k.nama_mata_kuliah}</div>
                </td>

                <td className="border px-4 py-3 text-center align-top">{k.sks}</td>
                <td className="border px-4 py-3 text-center align-top">{k.nama_kelas}</td>
                <td className="border px-4 py-3 align-top">{k.jenis_mata_kuliah}</td>

                <td className="border px-4 py-3 align-top">
                  {k.jadwal.map((j, i) => (
                    <div
                      key={i}
                      className="mb-4 last:mb-0"
                    >
                      <div>
                        {j.hari}, {j.waktu_mulai} - {j.waktu_selesai}
                      </div>
                      <div className="text-xs text-gray-500">Ruang : {j.ruangan}</div>
                    </div>
                  ))}
                </td>

                <td className="border px-4 py-3 align-top">
                  {k.dosen_pengajar.map((d) => (
                    <div key={d.nip_dosen}>{d.nama_dosen}</div>
                  ))}
                </td>

                <td className="border px-4 py-3 align-top">
                  <div className="flex justify-center">
                    <Button variant="destructive">
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
