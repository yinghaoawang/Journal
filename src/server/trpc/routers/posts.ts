import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit'; // for deno: see above
import { Redis } from '@upstash/redis'; // see below for cloudflare and fastly adapters

import { router, publicProcedure, privateProcedure } from '~/server/trpc/trpc';
import { TRPCError } from '@trpc/server';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit'
});

export const postsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({ take: 100 });
    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.userId)
    });
    return posts.map((post) => ({
      ...post,
      user: users.find((u) => u.id === post.userId)
    }));
  }),
  getById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findFirst({
        where: {
          id: input.id
        }
      });
      return posts;
    }),
  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        orderBy: z.enum(['asc', 'desc']).optional().default('asc')
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          userId: input.userId
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
        content: z.string().min(1).max(5000)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const post = await ctx.db.post.create({
        data: {
          userId,
          content: input.content
        }
      });
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
      const userId = ctx.userId;
      const matchingPost = await ctx.db.post.findFirst({
        where: {
          id: input.id
        }
      });

      if (matchingPost == null) throw new TRPCError({ code: 'NOT_FOUND' });

      if (matchingPost.userId != userId)
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
    })
});
