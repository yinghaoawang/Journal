import type { GetStaticProps, NextPage } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import ContentWrapper from '~/components/content-wrapper';
import { LoadingPage } from '~/components/loading';
import MutatePostView from '~/components/mutate-post-view';
import Custom404Page from '~/pages/404';
import { useUser } from '@clerk/nextjs';

const EditPostPage: NextPage<{ id: string }> = ({ id }) => {
  const { user } = useUser();
  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id });

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
    <ContentWrapper>
      <MutatePostView type="update" post={post} />
    </ContentWrapper>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const slug = context.params?.slug;
  if (typeof slug !== 'string') throw new Error('No slug');

  await helpers.posts.getById.prefetch({ id: slug });

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

export default EditPostPage;
