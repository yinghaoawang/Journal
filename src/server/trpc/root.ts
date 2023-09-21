import { postsRouter } from '~/server/trpc/routers/posts';
import { router } from '~/server/trpc/trpc';

// All routers added in /api/routers should be manually added here.
export const appRouter = router({
  posts: postsRouter
});

export type AppRouter = typeof appRouter;
