import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';

export const authRouter = createTRPCRouter({
    login: baseProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { username, password } = input;

            const user = await prisma.user.findUnique({
                where: { username },
                include: { mahasiswa: true },
            });

            if (!user) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid username or password',
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid username or password',
                });
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 jam

            await prisma.session.create({
                data: {
                    id_session: token,
                    id_user: user.id_user,
                    expires_at: BigInt(expiresAt.getTime()),
                },
            });

            const cookieStore = await cookies();
            cookieStore.set('session_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                expires: expiresAt,
            });

            return {
                id: user.id_user,
                username: user.username,
                nama: user.mahasiswa?.nama,
            };
        }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
        await prisma.session.delete({
            where: {
                id_session: ctx.auth?.session.id,
            },
        });

        const cookieStore = await cookies();
        cookieStore.delete('session_token');
    }),

    session: baseProcedure.query(async ({ ctx }) => {
        return ctx.auth;
    }),
});