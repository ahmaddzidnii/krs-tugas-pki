"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrapperKrs } from "@/components/wrapper-krs";
import { TabelInformasiUmum } from "@/components/table-informasi-umum";
import { TableKelasMataKuliah } from "@/components/table-kelas-mata-kuliah";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const KRSLihatPage = () => {
  const trpc = useTRPC();

  const {
    data: dataInformasiUmum = {
      tahun_akademik: "",
      semester: "",
      ipk: "0.00",
      sksKumulatif: "0",
      ipsLalu: "0.00",
      jatahSks: "0",
      sksAmbil: "0",
      sisaSks: "0",
    },
    isLoading: isLoadingInformasiUmum,
    isError: isErrorInformasiUmum,
  } = useQuery(trpc.krs.getInformasiUmum.queryOptions());
  return (
    <WrapperKrs title="Data Isian KRS Terakhir">
      <div className="space-y-4">
        <Tabs defaultValue="informasiUmum">
          <TabsList>
            <TabsTrigger value="informasiUmum">Informasi Umum</TabsTrigger>
          </TabsList>

          <TabsContent value="informasiUmum">
            <TabelInformasiUmum
              tahunAkademik={dataInformasiUmum.tahun_akademik}
              semester={dataInformasiUmum.semester}
              ipk={dataInformasiUmum.ipk}
              sksKumulatif={dataInformasiUmum.sksKumulatif}
              ipsLalu={dataInformasiUmum.ipsLalu}
              jatahSks={dataInformasiUmum.jatahSks}
              sksAmbil={dataInformasiUmum.sksAmbil}
              sisaSks={dataInformasiUmum.sisaSks}
              isLoading={isLoadingInformasiUmum}
              isError={isErrorInformasiUmum}
            />
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

const DaftarKelasMataKuliah = () => {
  return <TableKelasMataKuliah />;
};
