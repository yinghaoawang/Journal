import { type Post } from '@prisma/client';
import { privateProcedure, router } from '../trpc';
import { clerkClient } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/dist/types/server';

export type FeedContent = {
  user: User;
  post: Post;
};

export const feedRouter = router({
  getFeed: privateProcedure.query(async ({ ctx }) => {
    const authUserId = ctx.userId;
    const followingIds = (
      await ctx.db.follow.findMany({
        where: {
          followerId: authUserId
        }
      })
    ).map((follow) => follow.followingId);

    const feedContent: FeedContent[] = [];

    for (const followingId of followingIds) {
      const latestPost = await ctx.db.post.findFirst({
        where: { userId: followingId, deleted: false },
        orderBy: { updatedAt: 'desc' }
      });

      if (latestPost) {
        feedContent.push({
          user: await clerkClient.users.getUser(followingId),
          post: latestPost
        });
      }
    }

    return feedContent.sort(
      (a, b) => b.post.updatedAt.getTime() - a.post.updatedAt.getTime()
    );
  })
});
