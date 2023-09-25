import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, publicProcedure } from '~/server/trpc/trpc';

export const usersRouter = router({
  getAll: publicProcedure.query(async () => {
    const users = await clerkClient.users.getUserList();
    return users;
  }),
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      return user;
    })
});
