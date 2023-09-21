import { exampleRouter } from '~/server/trpc/routers/example';
import { router } from '~/server/trpc/trpc';

// This is the primary router for your server.
// All routers added in /api/routers should be manually added here.
export const appRouter = router({
  example: exampleRouter
});

export type AppRouter = typeof appRouter;
