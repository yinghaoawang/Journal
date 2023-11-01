import type { GetServerSideProps } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import MutatePostView from '~/components/post-views/mutate-post-view';
import Custom404Page from '~/pages/404';
import Layout from '~/components/layouts/layout';
import { type Post } from '@prisma/client';
import { type User, getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';

const EditPostPage = ({ user, post }: { user: User; post: Post }) => {
  if (post == null) {
    return <Custom404Page />;
  }

  return (
    <Layout>
      <MutatePostView user={user} type="update" post={post} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params
}) => {
  const { userId } = getAuth(req);
  if (userId == null)
    return {
      props: {
        post: null
      }
    };

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId },
    transformer: superjson
  });

  const postId = params?.postId;
  if (typeof postId !== 'string') throw new Error('No postId in search params');

  const authUser = await clerkClient.users.getUser(userId);

  const post = await helpers.posts.getById.fetch({ id: postId });

  return {
    props: {
      post: JSON.parse(JSON.stringify(post)) as Post,
      user: JSON.parse(JSON.stringify(authUser)) as User
    }
  };
};

export default EditPostPage;
