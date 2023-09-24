import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, procedure } from '~/server/trpc/trpc';

export const usersRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    const users = await clerkClient.users.getUserList();
    return users;
  }),
  get: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      return user;
    })
});
