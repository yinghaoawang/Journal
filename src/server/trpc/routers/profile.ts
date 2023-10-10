import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, privateProcedure } from '~/server/trpc/trpc';

export const profileRouter = router({
  updateDescription: privateProcedure
    .input(
      z.object({
        description: z.string().min(0).max(255)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const user = await clerkClient.users.getUser(authUserId);
      if (user == null) throw new Error('User does not exist in Clerk');
      return await clerkClient.users.updateUserMetadata(authUserId, {
        publicMetadata: {
          description: input.description
        }
      });
    }),
  updateSettings: privateProcedure
    .input(
      z.object({
        displayName: z
          .string()
          .min(0)
          .max(16, 'Display name must be less than 16 characters.'),
        isPublic: z.boolean()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const user = await clerkClient.users.getUser(authUserId);
      if (user == null) throw new Error('User does not exist in Clerk');
      return await clerkClient.users.updateUserMetadata(authUserId, {
        publicMetadata: {
          displayName: input.displayName,
          isPublic: input.isPublic
        }
      });
    })
});
