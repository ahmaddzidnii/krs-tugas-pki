import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "./prisma";

export const getServerSideSession = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
        return null;
    }

    const sessionWithUser = await prisma.session.findUnique({
        where: { id_session: token },
        include: {
            user: {
                omit: {
                    password: true,
                    created_at: true,
                    updated_at: true,
                },
                include: {
                    mahasiswa: {
                        select: {
                            nama: true,
                            programStudi: {
                                select: {
                                    nama: true,
                                    jenjang_studi: true,
                                    fakultas: {
                                        select: {
                                            nama: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

        },
    });

    if (!sessionWithUser) {
        return null;
    }

    return {
        session: {
            id: sessionWithUser.id_session,
            expires_at: sessionWithUser.expires_at,
        },
        user: {
            id: sessionWithUser.user.id_user,
            username: sessionWithUser.user.username,
            nama: sessionWithUser.user.mahasiswa?.nama,
            fakultas: sessionWithUser.user.mahasiswa?.programStudi?.fakultas?.nama,
            programStudi: {
                nama: sessionWithUser.user.mahasiswa?.programStudi?.nama,
                jenjang_studi: sessionWithUser.user.mahasiswa?.programStudi?.jenjang_studi,
            }

        }
    };
});

export async function requireAuth() {
    const session = await getServerSideSession();

    if (!session) {
        redirect("/login");
    }

    return session;
}

export async function requireUnAuth() {
    const session = await getServerSideSession();

    if (session) {
        redirect("/dash");
    }

    return session;
}