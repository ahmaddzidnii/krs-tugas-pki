"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type AuthContextType = {
  user: {
    id: string;
    username: string;
    nama: string;
    fakultas: string;
    programStudi: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ["/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const pathname = usePathname();

  const { data, isLoading } = useQuery(trpc.auth.session.queryOptions());

  const loginMutation = useMutation(trpc.auth.login.mutationOptions());
  const logoutMutation = useMutation(trpc.auth.logout.mutationOptions());

  const user = data?.user
    ? {
        id: data.user.username,
        username: data.user.username,
        nama: data.user.nama!,
        fakultas: data.user.fakultas!,
        programStudi: `${data.user.programStudi.jenjang_studi} ${data.user.programStudi.nama}`,
      }
    : null;

  const login = async (payload: { username: string; password: string }) => {
    await loginMutation.mutateAsync(payload);
    window.location.href = "/dash"; // full reload
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/login"; // full reload
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#105E15]" />
      </div>
    );
  }

  // Guard halaman private
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    window.location.href = "/login";
    return null;
  }

  // Sudah login tapi buka login
  if (user && PUBLIC_ROUTES.includes(pathname)) {
    window.location.href = "/dash";
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
