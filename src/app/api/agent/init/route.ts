import { getServerSideSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const EXPIRE_MS = 24 * 60 * 60 * 1000; // 24 jam

export async function POST() {

    const session = await getServerSideSession();

    const cookieStore = await cookies();
    const cookieThreadId = cookieStore.get("agent_thread_id")?.value;

    const now = BigInt(Date.now());
    const expiresAt = now + BigInt(EXPIRE_MS);

    let thread = null;

    // =========================
    // GUEST
    // =========================
    if (!session) {
        if (cookieThreadId) {
            thread = await prisma.thread.findFirst({
                where: {
                    id: cookieThreadId,
                    userId: null,
                    expiresAt: {
                        gt: now,
                    },
                },
            });
        }

        if (!thread) {
            thread = await prisma.thread.create({
                data: {
                    expiresAt,
                    created_at: now,
                    updated_at: now,
                },
            });
        }

        const response = NextResponse.json({ threadId: thread.id });

        response.cookies.set("agent_thread_id", thread.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(Number(thread.expiresAt)), // Cookie tetap butuh Date
        });

        return response;
    }

    // =========================
    // USER LOGIN
    // =========================
    const userId = session.user.id;

    // 1. Cari thread user yang masih aktif.
    thread = await prisma.thread.findFirst({
        where: {
            userId,
            expiresAt: {
                gt: now,
            },
        },
    });

    // 2. Kalau belum punya, claim thread guest.
    if (!thread && cookieThreadId) {
        const guestThread = await prisma.thread.findFirst({
            where: {
                id: cookieThreadId,
                userId: null,
                expiresAt: {
                    gt: now,
                },
            },
        });

        if (guestThread) {
            thread = await prisma.thread.update({
                where: { id: guestThread.id },
                data: {
                    userId,
                    expiresAt,
                    updated_at: now,
                },
            });
        }
    }

    // 3. Kalau tetap belum ada, buat thread baru.
    if (!thread) {
        thread = await prisma.thread.create({
            data: {
                userId,
                expiresAt,
                created_at: now,
                updated_at: now,
            },
        });
    }

    const response = NextResponse.json({ threadId: thread.id });

    response.cookies.set("agent_thread_id", thread.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(Number(thread.expiresAt)),
    });

    return response;
}