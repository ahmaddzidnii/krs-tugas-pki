"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrapperKrs } from "@/components/wrapper-krs";
import { TabelInformasiUmum } from "@/components/table-informasi-umum";
import { TableKelasMataKuliah } from "@/components/table-kelas-mata-kuliah";
import { informasiUmumMock, kelasMock } from "@/lib/krs-data";

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

const DaftarKelasMataKuliah = () => <TableKelasMataKuliah kelas={kelasMock} />;
