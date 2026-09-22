import type { DosenPengajar, JadwalKuliah, KelasKuliah } from "@/lib/krs-data";

const columns = ["No.", "Mata Kuliah", "SKS", "Kelas", "Jenis", "Jadwal", "Dosen"];

function JadwalCell({ jadwal }: { jadwal: JadwalKuliah[] }) {
  return jadwal.map((item) => (
    <div
      key={`${item.hari}-${item.waktu_mulai}-${item.ruangan}`}
      className="mb-5 last:mb-0"
    >
      <div>
        {item.hari}, {item.waktu_mulai} - {item.waktu_selesai}
      </div>
      <div className="text-xs text-gray-500">Ruang : {item.ruangan}</div>
    </div>
  ));
}

function DosenCell({ dosenPengajar }: { dosenPengajar: DosenPengajar[] }) {
  return dosenPengajar.map((dosen) => (
    <div
      key={dosen.nip_dosen}
      className="mb-5 last:mb-0"
    >
      {dosen.nama_dosen}
    </div>
  ));
}

function MataKuliahCell({ kelas }: { kelas: KelasKuliah }) {
  return (
    <>
      <div className="font-bold text-[#105E15]">{kelas.kode_kurikulum}</div>
      <div className="text-gray-500">{kelas.kode_mata_kuliah}</div>
      <div>{kelas.nama_mata_kuliah}</div>
    </>
  );
}

export function TableKelasMataKuliah({ kelas }: { kelas: KelasKuliah[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-gray-700">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border border-gray-300 px-4 py-3 font-semibold text-gray-600"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kelas.map((item, index) => (
            <tr
              key={item.id_kelas}
              className="hover:bg-gray-50"
            >
              <td className="border border-gray-300 px-4 py-3 text-center align-top">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <MataKuliahCell kelas={item} />
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center align-top">{item.sks}</td>
              <td className="border border-gray-300 px-4 py-3 text-center align-top">{item.nama_kelas}</td>
              <td className="border border-gray-300 px-4 py-3 align-top">{item.jenis_mata_kuliah}</td>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <JadwalCell jadwal={item.jadwal} />
              </td>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <DosenCell dosenPengajar={item.dosen_pengajar} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
