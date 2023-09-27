import type { GetStaticProps, NextPage } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import SuperJSON from 'superjson';
import Custom404Page from '../404';
import ContentWrapper from '~/components/content-wrapper';
import { LoadingPage } from '~/components/loading';
import JournalView from '~/components/journal-view';

const UserPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({ userId: id });

  if (user == null) {
    if (isLoading) {
      return <LoadingPage />;
    } else {
      return <Custom404Page />;
    }
  }

  return (
    <ContentWrapper>
      <h2 className="text-2lg font-bold">
        {user.firstName}&apos;s Journal Entries
      </h2>
      <JournalView user={user} />
    </ContentWrapper>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: SuperJSON
  });

  const slug = context.params?.slug;
  if (typeof slug !== 'string') throw new Error('No slug');

  await helpers.users.getById.prefetch({ userId: slug });

  return {
    props: {
      trpcState: JSON.stringify(helpers.dehydrate()),
      id: slug
    }
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export default UserPage;
