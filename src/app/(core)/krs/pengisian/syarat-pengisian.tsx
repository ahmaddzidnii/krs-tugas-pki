"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKRSValidation } from "@/contexts/krs-validation-context";
import Link from "next/link";
import { FaListCheck } from "react-icons/fa6";

export const SyaratPengisianSection = () => {
  const { syarat, isLoading, isError, isEligible } = useKRSValidation();
  return (
    <Tabs defaultValue="syaratPengisian">
      <TabsList>
        <TabsTrigger value="syaratPengisian">Syarat Pengisian</TabsTrigger>
      </TabsList>

      <TabsContent value="syaratPengisian">
        <div className="flex flex-col">
          <div className="mx-auto w-full max-w-4xl p-2 md:p-4">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-14 border border-gray-300 px-3 py-2 text-center">No.</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Syarat</th>
                  <th className="w-40 border border-gray-300 px-3 py-2 text-center">Isi</th>
                  <th className="w-24 border border-gray-300 px-3 py-2 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 px-3 py-3 text-center h-25"
                    >
                      <Spinner text="Sedang memuat syarat pengisian krs.." />
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 px-3 py-3 text-center text-red-600"
                    >
                      Error loading data.
                    </td>
                  </tr>
                ) : (
                  syarat?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-3 py-3 text-center">{idx + 1}.</td>

                      <td className="border border-gray-300 px-3 py-3">{item.syarat}</td>

                      <td className="border border-gray-300 px-3 py-3 text-center">{item.isi}</td>

                      <td className="border border-gray-300 px-3 py-3 text-center">
                        {item.boolean ? (
                          <svg
                            className="mx-auto h-5 w-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="mx-auto h-5 w-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isEligible && (
            <Button
              className="ms-auto"
              size="sm"
            >
              <Link
                href="#isi-krs"
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();

                  const target = document.getElementById("isi-krs");
                  target?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });

                  // Hapus hash dari URL tanpa reload
                  history.replaceState(null, "", window.location.pathname + window.location.search);
                }}
              >
                <FaListCheck />
                Pengisian KRS
              </Link>
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
