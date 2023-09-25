import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, publicProcedure, privateProcedure } from '~/server/trpc/trpc';

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
      const post = await ctx.db.post.create({
        data: {
          userId,
          content: input.content
        }
      });
      return post;
    })
});
