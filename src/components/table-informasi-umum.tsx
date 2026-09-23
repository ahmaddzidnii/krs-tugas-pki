import { Spinner } from "./spinner";

interface TabelInformasiUmumProps {
  tahunAkademik: string;
  semester: string;
  ipk: string;
  sksKumulatif: string;
  ipsLalu: string;
  jatahSks: string;
  sksAmbil: string;
  sisaSks: string;
  isLoading?: boolean;
  isError?: boolean;
}

export const TabelInformasiUmum = ({
  tahunAkademik,
  semester,
  ipk,
  sksKumulatif,
  ipsLalu,
  jatahSks,
  sksAmbil,
  sisaSks,
  isError,
  isLoading,
}: TabelInformasiUmumProps) => {
  const rows = [
    {
      left: { label: "Tahun Akademik", value: tahunAkademik },
      right: { label: "IPS Lalu", value: ipsLalu },
    },
    {
      left: { label: "Semester", value: semester, uppercase: true },
      right: { label: "Jatah SKS", value: jatahSks },
    },
    {
      left: { label: "IPK", value: ipk },
      right: { label: "SKS Ambil", value: sksAmbil },
    },
    {
      left: { label: "SKS Kumulatif", value: sksKumulatif },
      right: { label: "Sisa SKS", value: sisaSks },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-36 w-full items-center justify-center p-4">
        <Spinner text="Sedang memuat informasi umum.." />
      </div>
    );
  }

  if (isError) {
    return <div className="flex h-36 w-full items-center justify-center p-4 text-sm text-red-600">Error loading informasi umum.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        {/* Tampilan Desktop */}
        <tbody className="hidden lg:table-row-group">
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className="p-3 font-bold text-gray-600 w-1/4">{row.left.label}</td>
              <td className={`p-3 text-gray-800 w-1/4 ${row.left.uppercase ? "uppercase" : ""}`}>:&nbsp;&nbsp;{row.left.value}</td>
              <td className="p-3 font-bold text-gray-600 w-1/4">{row.right.label}</td>
              <td className="p-3 text-gray-800 w-1/4">:&nbsp;&nbsp;{row.right.value}</td>
            </tr>
          ))}
        </tbody>

        {/* Tampilan Mobile */}
        <tbody className="lg:hidden">
          {rows
            .flatMap((r) => [r.left, r.right])
            .map((item) => (
              <tr key={item.label}>
                <td className="p-3 font-bold text-gray-600 w-1/3">{item.label}</td>
                <td className={`p-3 text-gray-800 w-2/3`}>:&nbsp;&nbsp;{item.value}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
