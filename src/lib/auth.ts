import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "./prisma";
import { cache } from "react";

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
                            nama: true
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
            nama: sessionWithUser.user.mahasiswa?.nama

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