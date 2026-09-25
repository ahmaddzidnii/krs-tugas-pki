import { cookies } from 'next/headers';
import { baseProcedure, createTRPCRouter } from '../init';
import { authRouter } from './auth';
import { krsRouter } from './krs';
import prisma from '@/lib/prisma';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    krs: krsRouter,
    agent: {
        loadChat: baseProcedure.query(async () => {
            const cookiesStore = await cookies()
            const threadId = cookiesStore.get("agent_thread_id")?.value;

            if (!threadId) {
                return { messages: [] };
            }

            const messages = await prisma.message.findMany({
                where: { threadId },
                orderBy: { created_at: 'asc' },
                omit: {
                    threadId: true,
                    created_at: true,
                },
            });

            return { messages };
        })
    }
});

export type AppRouter = typeof appRouter;