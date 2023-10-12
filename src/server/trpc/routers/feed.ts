import { type Post } from '@prisma/client';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { clerkClient } from '@clerk/nextjs';
import { type FilteredUser, filterUserForClient } from './users';

export type FeedContent = {
  user: FilteredUser;
  post: Post;
};

export const feedRouter = router({
  getExploreFeed: publicProcedure.query(async ({ ctx }) => {
    const publicUsers = (await clerkClient.users.getUserList()).filter(
      (user) => user?.publicMetadata?.isPublic
    );

    const feedContent: FeedContent[] = [];

    for (const user of publicUsers) {
      const latestPost = await ctx.db.post.findFirst({
        where: { userId: user.id, deleted: false },
        orderBy: { updatedAt: 'desc' }
      });

      if (latestPost) {
        feedContent.push({
          user: filterUserForClient(user),
          post: latestPost
        });
      }
    }

    return feedContent.sort(
      (a, b) => b.post.updatedAt.getTime() - a.post.updatedAt.getTime()
    );
  }),
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
          user: filterUserForClient(
            await clerkClient.users.getUser(followingId)
          ),
          post: latestPost
        });
      }
    }

    return feedContent.sort(
      (a, b) => b.post.updatedAt.getTime() - a.post.updatedAt.getTime()
    );
  })
});
