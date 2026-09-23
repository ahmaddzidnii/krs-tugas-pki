// "use client";

// import React, { useEffect, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Spinner } from "@/components/spinner";
// import { RowTablePenawaranKelas, type BatchStatusResponse } from "./row-table-penawaran-kelas";
// import { useTRPC } from "@/trpc/client";

// const STATUS_KUOTA_KEY = ["krs", "statusKuotaBatch"] as const;

// export const TabelPenawaranKelasBatch = () => {
//   const trpc = useTRPC();
//   const queryClient = useQueryClient();

//   const [isRefetching, setIsRefetching] = useState<string[]>([]);
//   const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

//   const { data: daftarPenawaranKelas, isError, isLoading, isFetching } = useQuery(trpc.krs.getPenawaranKelas.queryOptions());

//   const { data: statuses = {} } = useQuery<BatchStatusResponse>({
//     queryKey: STATUS_KUOTA_KEY,
//     queryFn: () => ({}) as BatchStatusResponse,
//     initialData: {} as BatchStatusResponse,
//     staleTime: Infinity,

//   });

//   // Mutasi status kuota via tRPC dengan Optimistic Update ke Query Cache
//   const { mutate: batchRefreshKuota } = useMutation(
//     trpc.krs.getStatusKuotaKelasBatch.mutationOptions({
//       onMutate: async (variables) => {
//         const targetIds = variables.id_kelas;

//         // Tandai baris yang sedang me-refresh & hapus pesan error sebelumnya
//         setIsRefetching((prev) => [...new Set([...prev, ...targetIds])]);
//         setRowErrors((prev) => {
//           const next = { ...prev };
//           targetIds.forEach((id) => delete next[id]);
//           return next;
//         });

//         // Batalkan query aktif agar data cache tidak saling tumpang tindih
//         await queryClient.cancelQueries({ queryKey: STATUS_KUOTA_KEY });

//         // Simpan snapshot cache sebelumnya untuk rollback jika request gagal
//         const previousStatuses = queryClient.getQueryData<BatchStatusResponse>(STATUS_KUOTA_KEY);

//         return { previousStatuses, targetIds };
//       },
//       onSuccess: (newData) => {
//         // Merge hasil kuota baru ke dalam Query Cache tanpa menghapus baris lain
//         queryClient.setQueryData<BatchStatusResponse>(STATUS_KUOTA_KEY, (old = {}) => ({
//           ...old,
//           ...newData,
//         }));
//       },
//       onError: (error, variables, context) => {
//         // Rollback ke cache lama jika mutasi gagal
//         if (context?.previousStatuses) {
//           queryClient.setQueryData(STATUS_KUOTA_KEY, context.previousStatuses);
//         }

//         const targetIds = context?.targetIds ?? variables.id_kelas;
//         setRowErrors((prev) => {
//           const next = { ...prev };
//           targetIds.forEach((id) => {
//             next[id] = error.message;
//           });
//           return next;
//         });
//       },
//       onSettled: (_data, _error, variables, context) => {
//         const targetIds = context?.targetIds ?? variables?.id_kelas ?? [];
//         setIsRefetching((prev) => prev.filter((id) => !targetIds.includes(id)));
//       },
//     }),
//   );

//   // Trigger batch refresh pertama kali setelah daftar kelas berhasil diambil
//   useEffect(() => {
//     if (daftarPenawaranKelas?.semester_paket) {
//       const allIds = Object.values(daftarPenawaranKelas.semester_paket)
//         .flatMap((kelasList) => kelasList ?? [])
//         .map((k) => k?.id_kelas)
//         .filter((id): id is string => Boolean(id));

//       if (allIds.length > 0) {
//         batchRefreshKuota({ id_kelas: allIds });
//       }
//     }
//   }, [daftarPenawaranKelas, batchRefreshKuota]);

//   const handleRefetchRow = (id_kelas: string) => {
//     batchRefreshKuota({ id_kelas: [id_kelas] });
//   };

//   const renderTableBody = () => {
//     if (isLoading || isFetching) {
//       return (
//         <tr>
//           <td
//             colSpan={9}
//             className="border border-gray-300 px-4 py-12 text-center"
//           >
//             <Spinner text="Sedang memuat penawaran kelas.." />
//           </td>
//         </tr>
//       );
//     }

//     if (isError || !daftarPenawaranKelas) {
//       return (
//         <tr>
//           <td
//             colSpan={9}
//             className="border border-gray-300 px-4 py-8 text-center text-red-500"
//           >
//             Terjadi kesalahan saat memuat data penawaran kelas.
//           </td>
//         </tr>
//       );
//     }

//     const semesterEntries = Object.entries(daftarPenawaranKelas.semester_paket ?? {});
//     if (semesterEntries.length === 0) {
//       return (
//         <tr>
//           <td
//             colSpan={9}
//             className="border border-gray-300 px-4 py-8 text-center"
//           >
//             <div className="font-medium text-gray-700">Tidak ada penawaran kelas tersedia</div>
//             <div className="text-xs text-gray-500 mt-1">Silakan coba lagi nanti atau hubungi administrator</div>
//           </td>
//         </tr>
//       );
//     }

//     return semesterEntries.map(([semester, kelasList]) => (
//       <React.Fragment key={semester}>
//         <tr className="bg-gray-200">
//           <td
//             colSpan={9}
//             className="px-4 py-2 text-center font-bold text-gray-700 border border-gray-300"
//           >
//             SEMESTER PAKET {semester}
//           </td>
//         </tr>

//         {kelasList && kelasList.length > 0 ? (
//           kelasList.map((kelas, index) => (
//             <RowTablePenawaranKelas
//               key={kelas.id_kelas}
//               kelas={kelas}
//               index={index}
//               statusKouta={statuses[kelas.id_kelas]}
//               isRowLoading={isRefetching.includes(kelas.id_kelas)}
//               rowError={rowErrors[kelas.id_kelas] || null}
//               onRefetch={handleRefetchRow}
//             />
//           ))
//         ) : (
//           <tr>
//             <td
//               colSpan={9}
//               className="px-4 py-2 text-center text-gray-500 border border-gray-300"
//             >
//               Tidak ada kelas yang tersedia untuk semester ini.
//             </td>
//           </tr>
//         )}
//       </React.Fragment>
//     ));
//   };

//   return (
//     <table className="w-full text-sm text-left text-gray-700 border-collapse">
//       <thead className="bg-gray-50">
//         <tr>
//           <th className="px-4 py-3 font-semibold w-16 text-center border border-gray-300">No.</th>
//           <th className="px-4 py-3 font-semibold border border-gray-300">Mata Kuliah</th>
//           <th className="px-4 py-3 font-semibold text-center border border-gray-300">SKS</th>
//           <th className="px-4 py-3 font-semibold text-center border border-gray-300">Kelas</th>
//           <th className="px-4 py-3 font-semibold border border-gray-300">Jenis</th>
//           <th className="px-4 py-3 font-semibold border border-gray-300">Jadwal</th>
//           <th className="px-4 py-3 font-semibold border border-gray-300">Dosen</th>
//           <th className="px-4 py-3 font-semibold border border-gray-300">Terisi / Kuota</th>
//           <th className="px-4 py-3 font-semibold text-center border border-gray-300">Aksi</th>
//         </tr>
//       </thead>
//       <tbody>{renderTableBody()}</tbody>
//     </table>
//   );
// };

"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner";
import { RowTablePenawaranKelas, type BatchStatusResponse } from "./row-table-penawaran-kelas";
import { useTRPC } from "@/trpc/client";

export const TabelPenawaranKelasBatch = () => {
  const trpc = useTRPC();

  // State statuses cukup di sini: simpel, tidak bentrok dengan cache TanStack
  const [statuses, setStatuses] = useState<BatchStatusResponse>({});
  const [isRefetching, setIsRefetching] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const { data: daftarPenawaranKelas, dataUpdatedAt, isError, isLoading, isFetching } = useQuery(trpc.krs.getPenawaranKelas.queryOptions());

  // Mutasi tRPC murni tanpa fake-cache & tanpa rollback palsu
  const { mutate: batchRefreshKuota } = useMutation(
    trpc.krs.getStatusKuotaKelasBatch.mutationOptions({
      onMutate: (variables) => {
        const targetIds = variables.id_kelas;

        // Tandai baris yang lagi loading
        setIsRefetching((prev) => [...new Set([...prev, ...targetIds])]);

        // Hapus error lama di baris terkait
        setRowErrors((prev) => {
          const next = { ...prev };
          targetIds.forEach((id) => delete next[id]);
          return next;
        });
      },
      onSuccess: (newData) => {
        // Merge data baru ke data lama (data baris lain tetap aman!)
        setStatuses((prev) => ({
          ...prev,
          ...newData,
        }));
      },
      onError: (error, variables) => {
        setRowErrors((prev) => {
          const next = { ...prev };
          variables.id_kelas.forEach((id) => {
            next[id] = error.message;
          });
          return next;
        });
      },
      onSettled: (_data, _error, variables) => {
        // Matikan loading per baris
        setIsRefetching((prev) => prev.filter((id) => !variables?.id_kelas.includes(id)));
      },
    }),
  );

  // Trigger batch refresh tiap kali daftar kelas baru selesai dimuat (termasuk pas reload)
  useEffect(() => {
    if (daftarPenawaranKelas?.semester_paket) {
      const allIds = Object.values(daftarPenawaranKelas.semester_paket)
        .flatMap((kelasList) => kelasList ?? [])
        .map((k) => k?.id_kelas)
        .filter((id): id is string => Boolean(id));

      if (allIds.length > 0) {
        batchRefreshKuota({ id_kelas: allIds });
      }
    }
  }, [dataUpdatedAt, batchRefreshKuota]);

  const handleRefetchRow = (id_kelas: string) => {
    batchRefreshKuota({ id_kelas: [id_kelas] });
  };

  const renderTableBody = () => {
    if (isLoading || isFetching) {
      return (
        <tr>
          <td
            colSpan={9}
            className="border border-gray-300 px-4 py-12 text-center"
          >
            <Spinner text="Sedang memuat penawaran kelas.." />
          </td>
        </tr>
      );
    }

    if (isError || !daftarPenawaranKelas) {
      return (
        <tr>
          <td
            colSpan={9}
            className="border border-gray-300 px-4 py-8 text-center text-red-500"
          >
            Terjadi kesalahan saat memuat data penawaran kelas.
          </td>
        </tr>
      );
    }

    const semesterEntries = Object.entries(daftarPenawaranKelas.semester_paket ?? {});
    if (semesterEntries.length === 0) {
      return (
        <tr>
          <td
            colSpan={9}
            className="border border-gray-300 px-4 py-8 text-center"
          >
            <div className="font-medium text-gray-700">Tidak ada penawaran kelas tersedia</div>
            <div className="text-xs text-gray-500 mt-1">Silakan coba lagi nanti atau hubungi administrator</div>
          </td>
        </tr>
      );
    }

    return semesterEntries.map(([semester, kelasList]) => (
      <React.Fragment key={semester}>
        <tr className="bg-gray-200">
          <td
            colSpan={9}
            className="px-4 py-2 text-center font-bold text-gray-700 border border-gray-300"
          >
            SEMESTER PAKET {semester}
          </td>
        </tr>

        {kelasList && kelasList.length > 0 ? (
          kelasList.map((kelas, index) => (
            <RowTablePenawaranKelas
              key={kelas.id_kelas}
              kelas={kelas}
              index={index}
              statusKouta={statuses[kelas.id_kelas]}
              isRowLoading={isRefetching.includes(kelas.id_kelas)}
              rowError={rowErrors[kelas.id_kelas] || null}
              onRefetch={handleRefetchRow}
            />
          ))
        ) : (
          <tr>
            <td
              colSpan={9}
              className="px-4 py-2 text-center text-gray-500 border border-gray-300"
            >
              Tidak ada kelas yang tersedia untuk semester ini.
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  };

  return (
    <table className="w-full text-sm text-left text-gray-700 border-collapse">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 font-semibold w-16 text-center border border-gray-300">No.</th>
          <th className="px-4 py-3 font-semibold border border-gray-300">Mata Kuliah</th>
          <th className="px-4 py-3 font-semibold text-center border border-gray-300">SKS</th>
          <th className="px-4 py-3 font-semibold text-center border border-gray-300">Kelas</th>
          <th className="px-4 py-3 font-semibold border border-gray-300">Jenis</th>
          <th className="px-4 py-3 font-semibold border border-gray-300">Jadwal</th>
          <th className="px-4 py-3 font-semibold border border-gray-300">Dosen</th>
          <th className="px-4 py-3 font-semibold border border-gray-300">Terisi / Kuota</th>
          <th className="px-4 py-3 font-semibold text-center border border-gray-300">Aksi</th>
        </tr>
      </thead>
      <tbody>{renderTableBody()}</tbody>
    </table>
  );
};
