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
    })
});
