import { clerkClient } from '@clerk/nextjs';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router, privateProcedure, publicProcedure } from '~/server/trpc/trpc';
import { filterUserForClient } from './users';

export const followsRouter = router({
  getAuthFollowingUsers: privateProcedure.query(async ({ ctx }) => {
    const authUserId = ctx.userId;
    const follows = (
      await ctx.db.follow.findMany({
        where: {
          followerId: authUserId
        }
      })
    ).map((data) => data.followingId);
    const users = (await clerkClient.users.getUserList()).filter((u) =>
      follows.includes(u.id)
    );
    return users.map(filterUserForClient);
  }),
  getAuthFollowerUsers: privateProcedure.query(async ({ ctx }) => {
    const authUserId = ctx.userId;
    const follows = (
      await ctx.db.follow.findMany({
        where: {
          followingId: authUserId
        }
      })
    ).map((data) => data.followingId);
    const users = (await clerkClient.users.getUserList()).filter((u) =>
      follows.includes(u.id)
    );
    return users.map(filterUserForClient);
  }),
  getFollowingIds: privateProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const follows = await ctx.db.follow.findMany({
        where: {
          followerId: input.userId
        }
      });

      return follows.map((data) => data.followingId);
    }),
  getFollowerIds: privateProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const follows = await ctx.db.follow.findMany({
        where: {
          followingId: input.userId
        }
      });

      return follows.map((data) => data.followerId);
    }),
  getFollowerCount: publicProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.follow.count({
        where: {
          followingId: input.userId
        }
      });

      return count;
    }),
  getFollowingCount: publicProcedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.follow.count({
        where: {
          followerId: input.userId
        }
      });

      return count;
    }),
  isUserFollowingAuth: privateProcedure
    .input(
      z.object({
        followerUserId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const follow = await ctx.db.follow.findFirst({
        where: {
          followerId: authUserId,
          followingId: input.followerUserId
        }
      });

      return follow != null;
    }),
  isAuthFollowingUser: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const follow = await ctx.db.follow.findFirst({
        where: {
          followerId: authUserId,
          followingId: input.followingUserId
        }
      });

      return follow != null;
    }),
  followUser: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;

      const existingFollow = await ctx.db.follow.findFirst({
        where: {
          followerId: authUserId,
          followingId: input.followingUserId
        }
      });

      if (existingFollow != null)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already following the other user.'
        });

      const follow = await ctx.db.follow.create({
        data: {
          followerId: authUserId,
          followingId: input.followingUserId
        }
      });

      return follow;
    }),
  unfollowUser: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authUserId = ctx.userId;

      const existingFollow = await ctx.db.follow.findFirst({
        where: {
          followerId: authUserId,
          followingId: input.followingUserId
        }
      });

      if (existingFollow == null)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is not following the other user.'
        });

      const follow = await ctx.db.follow.delete({
        where: {
          id: existingFollow.id
        }
      });

      return follow;
    })
});
