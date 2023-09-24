import { postsRouter } from '~/server/trpc/routers/posts';
import { router } from '~/server/trpc/trpc';
import { usersRouter } from './routers/users';

// All routers added in /api/routers should be manually added here.
export const appRouter = router({
  posts: postsRouter,
  users: usersRouter
});

export type AppRouter = typeof appRouter;
