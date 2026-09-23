import { getServerSideSession } from '@/lib/auth';
import { getKrsAccess } from '@/lib/krs-rule';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';


export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await getServerSideSession();
    return {
        auth: session ? {
            user: {
                id: session.user.id,
                username: session.user.username,
                nama: session.user.nama
            },
            session: {
                id: session.session.id,
                expires_at: session.session.expires_at
            }
        } : null
    };
};

const t = initTRPC
    .context<Awaited<ReturnType<typeof createTRPCContext>>>()
    .create({
        /**
         * @see https://trpc.io/docs/server/data-transformers
         */
        transformer: superjson,
    });

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.auth) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',

        });
    }
    return next(
        {
            ctx: {
                auth: ctx.auth
            }
        }
    );
})

export const krsProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    const data = await getKrsAccess(ctx.auth.user.id, false);
    return next({ ctx: { ...ctx, ...data } });
});

export const krsActionProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    const data = await getKrsAccess(ctx.auth.user.id, true);
    return next({ ctx: { ...ctx, ...data } });
});
