import React from "react";

export const getPesanKonfirmasiAmbilKRS = (matakuliah: string, nama_kelas: string): React.ReactNode => {
  return (
    <span>
      Apakah Anda yakin mengambil kelas{" "}
      <strong>
        {matakuliah} - {nama_kelas}
      </strong>
      ?
    </span>
  );
};

export const getPesanKonfirmasiHapusKRS = (matakuliah: string, nama_kelas: string): React.ReactNode => {
  return (
    <span>
      Apakah Anda yakin menghapus kelas{" "}
      <strong>
        {matakuliah} - {nama_kelas}
      </strong>
      ?
    </span>
  );
};

export const getPesanBerhasilAmbilKrs = (matakuliah: string, nama_kelas: string): React.ReactNode => {
  return (
    <span>
      Kelas{" "}
      <strong>
        {matakuliah} - {nama_kelas}
      </strong>{" "}
      Berhasil Diambil
    </span>
  );
};

export const getPesanGagalAmbilKrs = (matakuliah: string, nama_kelas: string): React.ReactNode => {
  return (
    <span>
      Kelas{" "}
      <strong>
        {matakuliah} - {nama_kelas}
      </strong>{" "}
      Gagal Diambil
    </span>
  );
};

export const getPesanBerhasilHapusKrs = (matakuliah: string, nama_kelas: string): React.ReactNode => {
  return (
    <span>
      Kelas{" "}
      <strong>
        {matakuliah} - {nama_kelas}
      </strong>{" "}
      Berhasil Dihapus
    </span>
  );
};

export const getPesanGagalHapusKrs = (matakuliah: string, nama_kelas: string): React.ReactNode => {
  return (
    <span>
      Kelas{" "}
      <strong>
        {matakuliah} - {nama_kelas}
      </strong>{" "}
      Gagal Dihapus
    </span>
  );
};
