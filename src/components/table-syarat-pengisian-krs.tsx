import { useEffect } from "react";

interface SyaratPengisianKrsType {
  onSyaratPengisisanKrsEnabled?: (enabled: boolean) => void;
}

const syaratKrsMock = [
  {
    syarat: "Bayar Biaya Pendidikan Genap Tahun Akademik 2023/2024 = Sudah Bayar",
    isi: "Sudah Bayar",
    status: true,
  },
  {
    syarat: "Semester Mahasiswa = 3|4|5|6|7|8|9|10|11|12|13|14",
    isi: "4",
    status: true,
  },
  {
    syarat: "Status Mahasiswa = Aktif",
    isi: "Aktif",
    status: true,
  },
];

export const TableSyaratPengisianKrs = ({ onSyaratPengisisanKrsEnabled }: SyaratPengisianKrsType) => {
  useEffect(() => {
    // Mock: pengisian KRS selalu aktif
    onSyaratPengisisanKrsEnabled?.(true);
  }, [onSyaratPengisisanKrsEnabled]);

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-14 border border-gray-300 px-3 py-2 text-center">No.</th>
          <th className="border border-gray-300 px-3 py-2 text-center">Syarat</th>
          <th className="w-40 border border-gray-300 px-3 py-2 text-center">Isi</th>
          <th className="w-24 border border-gray-300 px-3 py-2 text-center">Status</th>
        </tr>
      </thead>

      <tbody>
        {syaratKrsMock.map((item, idx) => (
          <tr key={idx}>
            <td className="border border-gray-300 px-3 py-3 text-center">{idx + 1}.</td>

            <td className="border border-gray-300 px-3 py-3">{item.syarat}</td>

            <td className="border border-gray-300 px-3 py-3 text-center">{item.isi}</td>

            <td className="border border-gray-300 px-3 py-3 text-center">
              <svg
                className="mx-auto h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
