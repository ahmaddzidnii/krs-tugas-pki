"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

type SyaratKRS = {
  syarat: string;
  isi: string | number;
  boolean: boolean;
};

function useKRSValidationQuery() {
  const trpc = useTRPC();

  const query = useQuery(trpc.krs.getSyaratKrs.queryOptions());

  const computed = useMemo(() => {
    const syarat: SyaratKRS[] = query.data ?? [];

    const total = syarat.length;
    const totalValid = syarat.filter((item) => item.boolean).length;

    return {
      syarat,
      isEligible: total > 0 && total === totalValid,
      total,
      totalValid,
    };
  }, [query.data]);

  return {
    ...query,
    ...computed,
  };
}

type KRSValidationContextType = ReturnType<typeof useKRSValidationQuery>;

const KRSValidationContext = createContext<KRSValidationContextType | null>(null);

export function KRSValidationProvider({ children }: { children: ReactNode }) {
  const value = useKRSValidationQuery();

  return <KRSValidationContext.Provider value={value}>{children}</KRSValidationContext.Provider>;
}

export function useKRSValidation() {
  const context = useContext(KRSValidationContext);

  if (!context) {
    throw new Error("useKRSValidation harus di dalam provider.");
  }

  return context;
}
