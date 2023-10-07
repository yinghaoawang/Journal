import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router, privateProcedure } from '~/server/trpc/trpc';

export const followsRouter = router({
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
  getFollowerCount: privateProcedure
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
  getFollowingCount: privateProcedure
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
  isFollowingById: privateProcedure
    .input(
      z.object({
        followingUserId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.userId;
      const follower = await ctx.db.follow.findFirst({
        where: {
          followerId: authUserId,
          followingId: input.followingUserId
        }
      });

      return follower != null;
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
