/* YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context
 * 2. You want to create a new middleware or type of procedure
 */
import { TRPCError, initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { clerkClient } from '@clerk/nextjs';

type CreateContextOptions = Record<string, never>;

const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    db
  };
};

export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  const { req } = _opts;
  const { userId, user } = getAuth(req);
  return {
    ...createInnerTRPCContext({}),
    userId,
    user
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  }
});

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    });
  }

  return next({
    ctx: {
      userId: ctx.userId
    }
  });
});

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    });
  }

  const user = await clerkClient.users.getUser(ctx.userId);
  if (!user.privateMetadata.isAdmin) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    });
  }

  return next({
    ctx: {
      userId: ctx.userId
    }
  });
});

export const router = t.router;

export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
