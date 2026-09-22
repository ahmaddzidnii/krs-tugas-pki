import { Alert } from "@/components/alert";
import { Button } from "@/components/ui/button";
import { WrapperKrs } from "@/components/wrapper-krs";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { FaListCheck } from "react-icons/fa6";

const DashPage = async () => {
  const session = await requireAuth();
  return (
    <WrapperKrs title="Dashboard">
      <div className="space-y-4 font-sans">
        <Alert>
          <p className="text-sm">
            Assalamu'alaikum wa rahmatullahi wa barakatuh,
            <b className="text-[#105E15] uppercase">&nbsp; {session.user.nama}</b>
            <br />
            Selamat datang di Kartu Rencana Studi (KRS) UIN Sunan Kalijaga Yogyakarta.
          </p>
          <Link href="/krs/pengisian">
            <Button
              variant="default"
              className="mt-5"
            >
              <FaListCheck />
              Isi KRS
            </Button>
          </Link>
        </Alert>
      </div>
    </WrapperKrs>
  );
};

export default DashPage;
