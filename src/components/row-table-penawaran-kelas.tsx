import { FaSync } from "react-icons/fa";
import { FaExclamation, FaPlus, FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

export interface BatchStatus {
  terisi: number;
  kuota: number;
  is_full: boolean;
  is_joined: boolean;
}

export interface BatchStatusResponse {
  [key: string]: BatchStatus;
}

interface RowTablePenawaranKelasProps {
  kelas: any;
  index: number;
  statusKouta: BatchStatus;
}

export const RowTablePenawaranKelas = ({ kelas, index, statusKouta }: RowTablePenawaranKelasProps) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border px-4 py-3 text-center align-top">{index + 1}</td>

      <td className="border px-4 py-3 align-top">
        <div className="font-bold text-[#105E15]">{kelas.kode_kurikulum}</div>
        <div className="text-gray-500">{kelas.kode_mata_kuliah}</div>
        <div>{kelas.nama_mata_kuliah}</div>
      </td>

      <td className="border px-4 py-3 text-center align-top">{kelas.sks}</td>
      <td className="border px-4 py-3 text-center align-top">{kelas.nama_kelas}</td>
      <td className="border px-4 py-3 uppercase align-top">{kelas.jenis_mata_kuliah}</td>

      <td className="border px-4 py-3 align-top">
        {kelas.jadwal.map((j: any, idx: number) => (
          <div
            key={idx}
            className="mb-4 last:mb-0"
          >
            <div>
              {j.hari}, {j.waktu_mulai} - {j.waktu_selesai}
            </div>
            <div className="text-gray-500">
              Ruang: <span className="font-semibold">{j.ruangan}</span>
            </div>
          </div>
        ))}
      </td>

      <td className="border px-4 py-3 align-top">
        {kelas.dosen_pengajar.map((d: any) => (
          <div key={d.nip_dosen}>{d.nama_dosen}</div>
        ))}
      </td>

      <td className="border px-4 py-3 text-center align-top">
        {statusKouta.terisi}/{statusKouta.kuota}
      </td>

      <td className="border px-4 py-3 align-top">
        <div className="flex flex-col items-center gap-2">
          {statusKouta.is_full && !statusKouta.is_joined ? (
            <Button variant="kelasPenuh">
              <FaExclamation />
            </Button>
          ) : statusKouta.is_joined ? (
            <Button variant="destructive">
              <FaTrash />
            </Button>
          ) : (
            <Button>
              <FaPlus />
            </Button>
          )}

          <Button variant="reloadKouta">
            <FaSync />
          </Button>
        </div>
      </td>
    </tr>
  );
};
