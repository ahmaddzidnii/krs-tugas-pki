"use client";

import { FaSync } from "react-icons/fa";
import { FaExclamation, FaPlus, FaTrash } from "react-icons/fa6";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTRPC } from "@/trpc/client";
import { DataKrsSection } from "@/components/data-krs-section";
import { useKRSValidation } from "@/contexts/krs-validation-context";
import { TabelInformasiUmum } from "@/components/table-informasi-umum";
import { TabelPenawaranKelasBatch } from "@/components/tabel-penawaran-kelas-batch";

export const KontenPengisianKRS = () => {
  const { isLoading, isError, isEligible } = useKRSValidation();

  if (isLoading || isError || !isEligible) return null;

  return (
    <div id="isi-krs">
      <InformasiTabs />
      <PenawaranKelasSection />
    </div>
  );
};

const InformasiUmumSection = () => {
  const trpc = useTRPC();
  const {
    data = {
      tahun_akademik: "",
      semester: "",
      ipk: "0.00",
      sksKumulatif: "0",
      ipsLalu: "0.00",
      jatahSks: "0",
      sksAmbil: "0",
      sisaSks: "0",
    },
    isLoading,
    isError,
  } = useQuery(trpc.krs.getInformasiUmum.queryOptions());

  return (
    <TabelInformasiUmum
      tahunAkademik={data.tahun_akademik}
      semester={data.semester}
      ipk={data.ipk}
      sksKumulatif={data.sksKumulatif}
      ipsLalu={data.ipsLalu}
      jatahSks={data.jatahSks}
      sksAmbil={data.sksAmbil}
      sisaSks={data.sisaSks}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

const InfoAlerts = () => (
  <>
    <Alert variant="info">
      <p className="text-sm">Apabila kuota penuh, mata kuliah tidak ada, atau jadwal bentrok, silakan hubungi Program Studi.</p>
    </Alert>

    <Alert variant="info">
      <p className="text-sm">
        Menu cetak KRS disediakan di <span className="font-semibold text-[#105E15]">SIA UIN Sunan Kalijaga</span>.
      </p>
    </Alert>
  </>
);

const LegendSection = () => (
  <div>
    <h2 className="mb-4 text-sm font-bold">Keterangan :</h2>

    <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <li className="flex items-center text-sm">
        <Button className="mr-3 pointer-events-none">
          <FaPlus />
        </Button>
        Ambil Kelas
      </li>

      <li className="flex items-center text-sm">
        <Button
          variant="destructive"
          className="mr-3 pointer-events-none"
        >
          <FaTrash />
        </Button>
        Hapus Kelas
      </li>

      <li className="flex items-center text-sm">
        <Button
          variant="reloadKouta"
          className="mr-3 pointer-events-none"
        >
          <FaSync />
        </Button>
        Reload Kuota
      </li>

      <li className="flex items-center text-sm">
        <Button
          variant="kelasPenuh"
          className="mr-3 pointer-events-none"
        >
          <FaExclamation />
        </Button>
        Kelas Penuh
      </li>
    </ul>
  </div>
);

const InformasiTabs = () => (
  <Tabs defaultValue="informasiUmum">
    <TabsList>
      <TabsTrigger value="informasiUmum">Informasi Umum</TabsTrigger>
      <TabsTrigger value="dataKrs">Data KRS</TabsTrigger>
    </TabsList>

    <TabsContent value="informasiUmum">
      <div className="flex flex-col gap-5">
        <InformasiUmumSection />
        <InfoAlerts />
        <LegendSection />
      </div>
    </TabsContent>

    <TabsContent value="dataKrs">
      <DataKrsSection />
    </TabsContent>
  </Tabs>
);

const PenawaranKelasSection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  //  Cek apakah query sedang refetching untuk animasi loading di tombol
  const isReloading = useIsFetching(trpc.krs.getPenawaranKelas.queryFilter()) > 0;

  const handleReload = async () => {
    await queryClient.invalidateQueries(trpc.krs.getPenawaranKelas.queryFilter());
  };

  return (
    <div
      id="isi-krs"
      className="flex flex-col rounded-[5px] bg-white p-5 shadow"
    >
      <Button
        variant="reloadKouta"
        className="mb-4 ml-auto w-full md:w-auto"
        onClick={handleReload}
        disabled={isReloading}
      >
        <FaSync className={isReloading ? "animate-spin" : ""} />
        {isReloading ? "Memuat ulang..." : "Reload Penawaran Kelas"}
      </Button>

      <div className="overflow-x-auto">
        <TabelPenawaranKelasBatch />
      </div>
    </div>
  );
};
