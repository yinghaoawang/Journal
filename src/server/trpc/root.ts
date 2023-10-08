import { postsRouter } from '~/server/trpc/routers/posts';
import { router } from '~/server/trpc/trpc';
import { usersRouter } from './routers/users';
import { followsRouter } from './routers/follows';
import { feedRouter } from './routers/feed';
import { profileRouter } from './routers/profile';

// All routers added in /api/routers should be manually added here.
export const appRouter = router({
  posts: postsRouter,
  users: usersRouter,
  follows: followsRouter,
  feed: feedRouter,
  profile: profileRouter
});

export type AppRouter = typeof appRouter;
