import { z } from 'zod';

import { router, procedure } from '~/server/api/trpc';

export const exampleRouter = router({
  hello: procedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`
    };
  }),
  getAll: procedure.query(({ ctx }) => {
    return ctx.db.query.example.findMany();
  })
});
