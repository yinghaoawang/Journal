import { type User, getAuth } from '@clerk/nextjs/server';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { type GetServerSideProps } from 'next';
import superjson from 'superjson';
import { db } from '~/server/db';
import Layout from '~/components/layouts/layout';
import MutatePostView from '~/components/post-views/mutate-post-view';
import { appRouter } from '~/server/trpc/root';
import { type Draft } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs';

export default function NewJournalPage({
  user,
  userDraft
}: {
  user: User;
  userDraft: Draft | null;
}) {
  return (
    <Layout>
      <MutatePostView user={user} userDraft={userDraft} type="create" />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { userId: authUserId } = getAuth(req);
  if (!authUserId) throw new Error('Auth user ID does not exist');
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: authUserId },
    transformer: superjson
  });

  const authUser = await clerkClient.users.getUser(authUserId);

  const userDraft = await helpers.profile.getDraft.fetch();

  return {
    props: {
      userDraft: userDraft
        ? (JSON.parse(JSON.stringify(userDraft)) as Draft)
        : null,
      user: JSON.parse(JSON.stringify(authUser)) as User
    }
  };
};
