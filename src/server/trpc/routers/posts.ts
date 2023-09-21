import { z } from 'zod';

import { router, procedure } from '~/server/trpc/trpc';

export const postsRouter = router({
  getAll: procedure.query(({ ctx }) => {
    return ctx.db.post.findMany();
  })
});
