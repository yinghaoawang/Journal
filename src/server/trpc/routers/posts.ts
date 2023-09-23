import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, procedure } from '~/server/trpc/trpc';

export const postsRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({ take: 100 });
    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.userId)
    });
    return posts.map((post) => ({
      ...post,
      user: users.find((u) => u.id === post.userId)
    }));
  })
});
