import { createTRPCRouter } from '../init';
import { authRouter } from './auth';
import { krsRouter } from './krs';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    krs: krsRouter,
});

export type AppRouter = typeof appRouter;