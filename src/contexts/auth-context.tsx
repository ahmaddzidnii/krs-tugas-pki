"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";

type AuthContextType = {
  user: {
    id: string;
    username: string;
    nama: string;
  };
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data, isLoading } = useQuery(trpc.auth.session.queryOptions());

  const loginMutation = useMutation(trpc.auth.login.mutationOptions());
  const logoutMutation = useMutation(trpc.auth.logout.mutationOptions());

  const login = async (payload: { username: string; password: string }) => {
    await loginMutation.mutateAsync(payload);
    router.replace("/dash");
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    router.replace("/login");
    window.location.reload();
  };

  if (isLoading || !data?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#105E15]" />
      </div>
    );
  }

  const user = {
    id: data.user.id,
    username: data.user.username,
    nama: data.user.nama!,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        isAuthenticated: true,
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
