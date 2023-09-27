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
import dayjs from '~/utils/dayjs';
import Link from 'next/link';
import toast from 'react-hot-toast';

const JournalView = ({ user }: { user: User }) => {
  const utils = trpc.useContext();
  const postsRes = trpc.posts.getByUserId.useQuery({
    userId: user.id,
    orderBy: 'desc'
  });

  const { mutate } = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success('Post deleted successfully!');
      void utils.posts.getByUserId.invalidate({ userId: user.id });
    },
    onError: (error) => {
      console.log(error);
      const errorMessage = error?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to delete post!');
      }
    }
  });

  if (postsRes.isLoading) {
    return <LoadingSpinner />;
  }

  const handleDeletePostClick = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (confirmed) {
      mutate({ id });
    }
  };

  const posts = postsRes.data;

  return (
    <>
      {posts?.map((post) => (
        <div className="my-5 flex flex-col" key={post.id}>
          <div className="mr-5 flex justify-end gap-2">
            <Link
              className="text-blue-500"
              href={`/journal/post/edit/${post.id}`}
            >
              edit
            </Link>
            <button
              onClick={() => handleDeletePostClick(post.id)}
              className="text-blue-500"
            >
              delete
            </button>
          </div>
          <div className="journal-lines whitespace-pre-wrap">
            <p className="font-light text-gray-600">
              {dayjs(post.createdAt).format('MMMM DD, YYYY')}
            </p>
            <p>Dear Journal,</p>
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
