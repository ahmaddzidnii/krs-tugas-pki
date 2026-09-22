import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import LoginForm from "./login-form";
import { getKrsScheduleStatus } from "@/lib/services/krs-schedule";

const Page = async () => {
  const { isKrsOpen, reason, periode } = await getKrsScheduleStatus();

  const formatTanggal = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date);

  let message = "";

  switch (reason) {
    case "NO_ACTIVE_PERIOD":
      message = "Tidak ada periode akademik yang aktif. Silakan hubungi pihak akademik.";
      break;

    case "OUTSIDE_DATE":
      message = "Akses aplikasi saat ini sedang dinonaktifkan karena bukan masa pengisian KRS.";
      break;

    case "OUTSIDE_TIME":
      message = `KRS hanya dapat diakses pada ${formatTanggal(periode!.tanggal_mulai_krs)} – ${formatTanggal(
        periode!.tanggal_selesai_krs,
      )}, setiap pukul ${periode!.waktu_buka_harian} – ${periode!.waktu_tutup_harian} WIB.`;
      break;
  }
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center w-full h-full px-4 sm:px-0">
        <div className="mb-4">
          <Logo />
        </div>

        <Card className="w-full max-w-112.5 sm:w-112.5 rounded-[5px] border-t-4 sm:border-t-5 border-t-primary">
          <CardContent className="flex flex-col gap-3 sm:gap-5 p-4 sm:p-6">
            <CardHeader className="text-center p-0">
              <h1 className="uppercase font-bold text-sm sm:text-base text-[#777777] my-2.5 p-2">KARTU RENCANA STUDI</h1>

              <div className="rounded-[5px] bg-[#d1ecf1] text-[#0c5460] text-start p-3 sm:p-5 text-sm border-[#bee5eb] leading-6">
                Jika mengalami error bisa disampaikan melalui
                <br />
                <a
                  href="https://uinsk.id/AplikasiKRS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-bold text-[#005A00] break-all sm:break-normal italic"
                >
                  https://uinsk.id/AplikasiKRS
                </a>
              </div>
            </CardHeader>

            {isKrsOpen ? <LoginForm /> : <div className="rounded-md border border-[#bee5eb] bg-[#d1ecf1] p-4 text-sm text-[#0c5460]">{message}</div>}
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-xs text-center px-4 max-w-md mt-4">
          Copyright © {new Date().getFullYear()} <span className="font-bold">PTIPD - UIN Sunan Kalijaga.</span> All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Page;
