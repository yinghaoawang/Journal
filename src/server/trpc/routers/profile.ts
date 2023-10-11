import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, privateProcedure, publicProcedure } from '~/server/trpc/trpc';

export const profileRouter = router({
  isUserHiddenToAuth: publicProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;

      const user = await clerkClient.users.getUser(input.userId);

      // if session user is not logged in, only need to check if target user is public
      if (authUserId == null) {
        return !user?.publicMetadata?.isPublic;
      }

      if (input.userId == authUserId) return false; // not hidden if user is auth user
      const isFollowingAuth = await ctx.db.follow.findFirst({
        where: {
          followerId: input.userId,
          followingId: authUserId
        }
      });
      if (isFollowingAuth) return false; // not hidden if user is following auth user
      if (user?.publicMetadata?.isPublic) return false; // not hidden if user is public
      return true; // hidden otherwise
    }),
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
          displayName: input.displayName.length > 0 ? input.displayName : null,
          isPublic: input.isPublic
        }
      });
    })
});
