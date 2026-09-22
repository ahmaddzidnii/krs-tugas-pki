"use client";

import { useCallback, useState, memo } from "react";
import { FaSync } from "react-icons/fa";
import { FaExclamation, FaListCheck, FaPlus, FaTrash } from "react-icons/fa6";

import { Alert } from "@/components/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrapperKrs } from "@/components/wrapper-krs";
import Link from "next/link";
import { TableSyaratPengisianKrs } from "@/components/table-syarat-pengisian-krs";
import { DataKrsSection } from "@/components/data-krs-section";
import { TabelPenawaranKelasBatch } from "@/components/tabel-penawaran-kelas-batch";
import { TabelInformasiUmum } from "@/components/table-informasi-umum";

const KRSPengisianPage = () => {
  const [isKrsEnabled, setIsKrsEnabled] = useState(false);

  const handleSyaratEnabled = useCallback((enabled: boolean) => {
    setIsKrsEnabled(enabled);
  }, []);

  return (
    <WrapperKrs title="Pengisian Kartu Rencana Studi">
      <div className="space-y-4">
        <SyaratPengisianSection
          onSyaratEnabled={handleSyaratEnabled}
          isKrsEnabled={isKrsEnabled}
        />

        {isKrsEnabled && (
          <>
            <InformasiTabs />
            <PenawaranKelasSection />
          </>
        )}
      </div>
    </WrapperKrs>
  );
};

export default KRSPengisianPage;

const InformasiUmumSection = () => (
  <TabelInformasiUmum
    tahunAkademik="2026/2027"
    semester="Ganjil"
    ipk="3.76"
    sksKumulatif="126"
    ipsLalu="3.63"
    jatahSks="24"
    sksAmbil="20"
    sisaSks="4"
  />
);

/* ---------------- UI SECTIONS ---------------- */

const PengisianKrsButton = memo(({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <Button
      className="ms-auto"
      size="sm"
    >
      <Link
        href="#isi-krs"
        className="flex items-center gap-2"
      >
        <FaListCheck />
        Pengisian KRS
      </Link>
    </Button>
  );
});

const SyaratPengisianSection = memo(({ onSyaratEnabled, isKrsEnabled }: { onSyaratEnabled: (enabled: boolean) => void; isKrsEnabled: boolean }) => (
  <Tabs defaultValue="syaratPengisian">
    <TabsList>
      <TabsTrigger value="syaratPengisian">Syarat Pengisian</TabsTrigger>
    </TabsList>

    <TabsContent value="syaratPengisian">
      <div className="flex flex-col">
        <div className="mx-auto w-full max-w-4xl p-2 md:p-4">
          <TableSyaratPengisianKrs onSyaratPengisisanKrsEnabled={onSyaratEnabled} />
        </div>

        <PengisianKrsButton isVisible={isKrsEnabled} />
      </div>
    </TabsContent>
  </Tabs>
));

const InfoAlerts = memo(() => (
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
));

const LegendSection = memo(() => (
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
));

const InformasiTabs = memo(() => (
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
));

const PenawaranKelasSection = memo(() => (
  <div
    id="isi-krs"
    className="flex flex-col rounded-[5px] bg-white p-5 shadow"
  >
    <Button
      variant="reloadKouta"
      className="mb-4 ml-auto w-full md:w-auto"
    >
      <FaSync />
      Reload Penawaran Kelas
    </Button>

    <div className="overflow-x-auto">
      <TabelPenawaranKelasBatch />
    </div>
  </div>
));
