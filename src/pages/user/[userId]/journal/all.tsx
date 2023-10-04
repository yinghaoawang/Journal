import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Layout from '~/components/layouts/layout';
import AllPostsView from '~/components/post-views/all-posts-view';
import Custom404Page from '~/pages/404';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import { type GetStaticProps } from 'next';
import { type User } from '@clerk/nextjs/dist/types/server';
import { type Post } from '@prisma/client';

export const JournalPageContent = ({ userId }: { userId: string }) => {
  const { data: user, isLoading: isUserLoading } = trpc.users.getById.useQuery({
    userId
  });

  const { data: posts, isLoading: isPostsLoading } =
    trpc.posts.getByUserId.useQuery({
      userId,
      orderBy: 'desc'
    });

  if (isUserLoading || isPostsLoading) return <LoadingPage />;
  if (user == null || posts == null) return <Custom404Page />;

  return (
    <Layout>
      <AllPostsView posts={posts} user={user} />
    </Layout>
  );
};

export default function UserJournalAllPage({
  user,
  posts
}: {
  user: User;
  posts: Post[];
}) {
  return (
    <Layout>
      <AllPostsView posts={posts} user={user} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const userId = context.params?.userId;
  if (typeof userId !== 'string') throw new Error('No userId in search params');

  const user = await helpers.users.getById.fetch({ userId });
  const posts = await helpers.posts.getByUserId.fetch({
    userId,
    orderBy: 'desc'
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)) as User,
      posts: JSON.parse(JSON.stringify(posts)) as Post[]
    }
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};
