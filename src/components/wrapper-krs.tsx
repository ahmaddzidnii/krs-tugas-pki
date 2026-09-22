import { Alert } from "@/components/alert";

interface WrapperKrsProps {
  children: React.ReactNode;
  title: string;
}

export const WrapperKrs = ({ children, title }: WrapperKrsProps) => {
  return (
    <div className="lg:rounded-r-xl overflow-hidden shadow h-full">
      <header className="bg-white shadow  w-full">
        <nav className="px-3 py-2.5 border-b-4 w-max border-b-[#105E15] ">
          <span className="text-base  md:text-lg  ">{title}</span>
        </nav>
      </header>
      <div className="shadow flex-1 h-full p-5 md:p-10 flex flex-col gap-5 bg-[#ecedf1c7]">
        <Alert>
          <p className="text-sm">
            Jika mengalami error silahkan disampaikan melalui{" "}
            <a
              target="_blank"
              className="hover:underline font-bold text-[#105E15] italic"
              href="https://uinsk.id/AplikasiKRS"
            >
              https://uinsk.id/AplikasiKRS
            </a>
          </p>
        </Alert>
        {children}
      </div>
    </div>
  );
};
