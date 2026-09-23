import { WrapperKrs } from "@/components/wrapper-krs";

import { KRSValidationProvider } from "@/contexts/krs-validation-context";
import { SyaratPengisianSection } from "./syarat-pengisian";
import { KontenPengisianKRS } from "./konten-pengisian";

const KRSPengisianPage = () => {
  return (
    <WrapperKrs title="Pengisian Kartu Rencana Studi">
      <KRSValidationProvider>
        <div className="space-y-4">
          <SyaratPengisianSection />
          <KontenPengisianKRS />
        </div>
      </KRSValidationProvider>
    </WrapperKrs>
  );
};

export default KRSPengisianPage;
