import type { GetStaticProps, NextPage } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import SuperJSON from 'superjson';
import Custom404Page from '../404';
import ContentWrapper from '~/components/content-wrapper';
import { LoadingPage, LoadingSpinner } from '~/components/loading';
import type { User } from '@clerk/nextjs/dist/types/server';
import Image from 'next/image';
import dayjs from '~/utils/dayjs';

const PostsView = ({ user }: { user: User }) => {
  const postsRes = trpc.posts.getByUserId.useQuery({ userId: user.id });
  if (postsRes.isLoading) {
    return <LoadingSpinner />;
  }

  const posts = postsRes.data;

  return (
    <>
      {posts?.map((post) => (
        <div className="flex gap-3" key={post.id}>
          <div className="pt-1">
            <Image
              className="rounded-full"
              width={40}
              height={40}
              src={user?.imageUrl ?? '/default-avatar.png'}
              alt="Profile picture"
            />
          </div>
          <div>
            <div>
              By {user?.firstName ?? 'Anonymous'}{' '}
              <span className="font-light text-gray-600">
                {dayjs(post.createdAt).fromNow()}
              </span>
            </div>
            <p>{post.content}</p>
          </div>
        </div>
      ))}
    </>
  );
};

const UserPage: NextPage<{ id: string }> = ({ id }) => {
  const userRes = trpc.users.getById.useQuery({ userId: id });

  if (userRes.data == null) {
    if (userRes.isLoading) {
      return <LoadingPage />;
    } else {
      return <Custom404Page />;
    }
  }

  const user = userRes.data;

  return (
    <ContentWrapper>
      <p>User: {user.firstName}</p>
      <h2>Journal Entries</h2>
      <PostsView user={user} />
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
