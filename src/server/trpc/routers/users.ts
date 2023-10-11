import { clerkClient } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/dist/types/server';
import { z } from 'zod';

import { router, publicProcedure } from '~/server/trpc/trpc';

export type FilteredUser = {
  id: string;
  imageUrl: string;
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
  getAll: publicProcedure.query(async () => {
    const users = await clerkClient.users.getUserList();
    return users
      .filter((user) => user?.publicMetadata?.isPublic)
      .map(filterUserForClient);
  }),
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      if (!user?.publicMetadata?.isPublic) return null;
      return filterUserForClient(user);
    })
});
