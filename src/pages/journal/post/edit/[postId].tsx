import type { GetStaticProps, NextPage } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import { LoadingPage } from '~/components/loading';
import MutatePostView from '~/components/post-views/mutate-post-view';
import Custom404Page from '~/pages/404';
import { useUser } from '@clerk/nextjs';
import Layout from '~/components/layouts/layout';

const EditPostPage = ({ postId }: { postId: string }) => {
  const { user } = useUser();
  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id: postId });

  if (post == null) {
    if (isLoading) {
      return <LoadingPage />;
    } else {
      return <Custom404Page />;
    }
  }

  if (post.userId != user?.id) {
    console.error('Unauthorized');
    return <Custom404Page />;
  }

  return (
    <Layout>
      <MutatePostView type="update" post={post} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const postId = context.params?.postId;
  if (typeof postId !== 'string') throw new Error('No postId in search params');

  await helpers.posts.getById.prefetch({ id: postId });

  return {
    props: {
      trpcState: JSON.stringify(helpers.dehydrate()),
      postId: postId
    }
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export default EditPostPage;
