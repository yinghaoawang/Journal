import { clerkClient } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/dist/types/server';
import { z } from 'zod';

import { router, publicProcedure, privateProcedure } from '~/server/trpc/trpc';
import { isUserTrustAuth } from './profile';

type FilteredHiddenUser = {
  id: string;
  createdAt: number;
  firstName: string | null;
  isPublic: boolean;
  displayName: string | null;
};

/**
 * Filters a user to only include public information
 */
export const filterHiddenUserForClient = (user: User): FilteredHiddenUser => {
  const { id, publicMetadata, createdAt, firstName } = user;
  return {
    id,
    createdAt,
    firstName,
    isPublic: publicMetadata?.isPublic ? true : false,
    displayName: publicMetadata?.displayName as string | null
  };
};

export type FilteredUser = {
  id: string;
  imageUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: number;
  isPublic: boolean;
  displayName: string | null;
  description: string | null;
};

export const filterUserForClient = (user: User): FilteredUser => {
  const { id, imageUrl, firstName, lastName, publicMetadata, createdAt } = user;
  return {
    id,
    imageUrl,
    firstName,
    lastName,
    createdAt,
    isPublic: publicMetadata?.isPublic ? true : false,
    displayName: publicMetadata?.displayName as string | null,
    description: publicMetadata?.description as string | null
  };
};

export const usersRouter = router({
  getPublicUsers: publicProcedure.query(async () => {
    const users = await clerkClient.users.getUserList();
    return users
      .filter((user) => user?.publicMetadata?.isPublic)
      .map(filterUserForClient);
  }),
  /**
   * Gets a user by their ID. If the user is not public, then an error is thrown
   */
  getDetailedUserById: privateProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const authUser = authUserId
        ? await clerkClient.users.getUser(authUserId)
        : null;
      const user = await clerkClient.users.getUser(input.userId);
      if (!(await isUserTrustAuth(authUser, user, ctx.db))) return null;
      return filterUserForClient(user);
    }),

  /**
   * Gets a user by their ID. It will only show public data
   */
  getHiddenUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      const hiddenUser = filterHiddenUserForClient(user);
      const convertedUser: FilteredUser = {
        ...hiddenUser,
        imageUrl: null,
        lastName: null,
        description: null
      };
      return convertedUser;
    })
});
