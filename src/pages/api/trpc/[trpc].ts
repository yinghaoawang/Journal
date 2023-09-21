import { createNextApiHandler } from '@trpc/server/adapters/next';

import { appRouter } from '~/server/trpc/root';
import { createTRPCContext } from '~/server/trpc/trpc';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ TRPC failed on ${path ?? '<no-path>'}: ${error.message}`
          );
        }
      : undefined
});
