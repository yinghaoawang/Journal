import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit'; // for deno: see above
import { Redis } from '@upstash/redis'; // see below for cloudflare and fastly adapters

import { router, publicProcedure, privateProcedure } from '~/server/trpc/trpc';
import { TRPCError } from '@trpc/server';
import { filterUserForClient } from './users';
import { isUserTrustAuth } from './profile';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit'
});

export const postsRouter = router({
  getCountByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const postCount = await ctx.db.post.count({
        where: {
          userId: input.userId,
          deleted: false
        }
      });
      return postCount;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      where: {
        deleted: false
      }
    });
    const filteredUsers = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.userId)
      })
    )
      .filter((user) => user.publicMetadata?.isPublic) // only fetch public users
      .map(filterUserForClient);
    return posts.map((post) => ({
      ...post,
      user: filteredUsers.find((u) => u.id === post.userId)
    }));
  }),
  getById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          deleted: false
        }
      });

      const authUserId = ctx.userId;
      const authUser = authUserId
        ? await clerkClient.users.getUser(authUserId)
        : null;

      const userId = post?.userId;
      if (userId == null) return null;
      const user = await clerkClient.users.getUser(userId);

      if (!(await isUserTrustAuth(authUser, user, ctx.db))) return null;
      return post;
    }),
  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        orderBy: z.enum(['asc', 'desc']).optional().default('asc')
      })
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const authUser = authUserId
        ? await clerkClient.users.getUser(authUserId)
        : null;
      const user = await clerkClient.users.getUser(input.userId);
      if (!(await isUserTrustAuth(authUser, user, ctx.db))) return null;

      const posts = await ctx.db.post.findMany({
        where: {
          userId: input.userId,
          deleted: false
        },
        orderBy: {
          createdAt: input.orderBy
        }
      });
      return posts;
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1)
          .max(5000, 'Posts can only have a maximum of 5000 characters.')
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;

      const { success } = await ratelimit.limit(authUserId);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const post = await ctx.db.post.create({
        data: {
          userId: authUserId,
          content: input.content
        }
      });

      // delete draft if exists
      const draft = await ctx.db.draft.findFirst({
        where: {
          userId: authUserId
        }
      });
      if (draft) {
        await ctx.db.draft.delete({
          where: {
            id: draft.id
          }
        });
      }

      return post;
    }),
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(5000)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const existingPost = await ctx.db.post.findFirst({
        where: {
          id: input.id
        }
      });

      if (existingPost == null) throw new TRPCError({ code: 'NOT_FOUND' });

      if (existingPost.userId != authUserId)
        throw new TRPCError({ code: 'UNAUTHORIZED' });

      const post = await ctx.db.post.update({
        where: {
          id: input.id
        },
        data: {
          content: input.content
        }
      });
      return post;
    }),

  delete: privateProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const existingPost = await ctx.db.post.findFirst({
        where: {
          id: input.id
        }
      });

      if (existingPost == null) throw new TRPCError({ code: 'NOT_FOUND' });

      if (existingPost.userId != authUserId)
        throw new TRPCError({ code: 'UNAUTHORIZED' });

      const post = await ctx.db.post.update({
        where: {
          id: input.id
        },
        data: {
          deleted: true
        }
      });
      return post;
    })
});
