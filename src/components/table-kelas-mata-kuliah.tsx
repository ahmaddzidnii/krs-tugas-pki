import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Spinner } from "./spinner";

export const TableKelasMataKuliah = () => {
  const trpc = useTRPC();

  const { data: dataKrs, isLoading, isError } = useQuery(trpc.krs.getDataKelasYangDiambil.queryOptions());

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan={8}
            className="h-25 border border-gray-300 px-4 py-3 text-center"
          >
            <Spinner text="Sedang memuat data KRS..." />
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td
            colSpan={8}
            className="h-25 border border-gray-300 px-4 py-3 text-center text-red-600"
          >
            Error loading data KRS.
          </td>
        </tr>
      );
    }

    if (!dataKrs || dataKrs.length === 0) {
      return (
        <tr>
          <td
            colSpan={8}
            className="h-25 border border-gray-300 px-4 py-3 text-center"
          >
            Tidak ada data KRS yang tersedia.
          </td>
        </tr>
      );
    }

    return dataKrs?.map((k, idx) => (
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
          {k.jadwal.length === 0 && <div className="flex items-center justify-center">-</div>}
          {k.jadwal.map((j, idx) => (
            <div
              key={idx}
              className={k.jadwal.length > 1 && idx !== k.jadwal.length - 1 ? "mb-5" : ""}
            >
              <div>
                {j.hari}, {j.waktu_mulai} - {j.waktu_selesai}
              </div>
              <div className=" text-primary">
                Ruang: <span className="font-semibold">{j.ruangan}</span>
              </div>
            </div>
          ))}
        </td>

        <td className="border px-4 py-3 align-top">
          {k.dosen_pengajar.map((d) => (
            <div key={d.nip_dosen}>{d.nama_dosen}</div>
          ))}
        </td>
      </tr>
    ));
  };

  return (
    <div className="w-full max-w-7xl rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              {["No.", "Mata Kuliah", "SKS", "Kelas", "Jenis", "Jadwal", "Dosen"].map((item) => (
                <th
                  key={item}
                  className="border border-gray-300 px-4 py-3 font-semibold text-gray-600"
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>
    </div>
  );
};
