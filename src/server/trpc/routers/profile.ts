import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

import { router, privateProcedure, publicProcedure } from '~/server/trpc/trpc';
import { type User } from '@clerk/nextjs/dist/types/server';
import { type PrismaClient } from '@prisma/client';

export const isUserTrustAuth = async (
  authUser: User | null,
  user: User,
  db: PrismaClient
) => {
  // if session user is not logged in, only need to check if target user is public
  if (authUser == null) {
    return user?.publicMetadata?.isPublic;
  }

  if (user.id == authUser.id) return true; // trust if user is same as auth user
  const isFollowingAuth = await db.follow.findFirst({
    where: {
      followerId: user.id,
      followingId: authUser.id
    }
  });
  if (isFollowingAuth) return true; // not hidden if user is following auth user
  if (user?.publicMetadata?.isPublic) return true; // not hidden if user is public
  return false; // hidden otherwise
};

export const profileRouter = router({
  isUserHiddenToAuth: publicProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const authUser = authUserId
        ? await clerkClient.users.getUser(authUserId)
        : null;
      const user = await clerkClient.users.getUser(input.userId);
      return !(await isUserTrustAuth(authUser, user, ctx.db));
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
