import { z } from "zod";
import { tool } from "langchain/tools";
import { caller } from "@/trpc/server";

export const LOGOUT_USER = tool(
    async () => {
        await caller.auth.logout();
        return {
            success: true,
            message: "User berhasil logout.",
        };
    },
    {
        name: "LOGOUT_USER",
        description:
            "Logout pengguna yang sedang login dengan menghapus sesi autentikasi aktif. Gunakan hanya jika pengguna meminta keluar dari akun atau logout.",
        schema: z.object({}),
    }
);