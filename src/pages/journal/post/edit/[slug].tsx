import type { GetStaticProps, NextPage } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import SuperJSON from 'superjson';
import ContentWrapper from '~/components/content-wrapper';
import { LoadingPage, LoadingSpinner } from '~/components/loading';
import dayjs from '~/utils/dayjs';
import { type ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Custom404Page from '~/pages/404';
import type { Post } from '@prisma/client';
import toast from 'react-hot-toast';

function EditPostView({ post }: { post: Post }) {
  const router = useRouter();
  const [textInput, setTextInput] = useState(post.content);
  const { mutate, isLoading: isPosting } = trpc.posts.update.useMutation({
    onSuccess: () => {
      setTextInput('');
      router.push('/journal');
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content?.[0];
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update post!');
      }
    }
  });
  return (
    <ContentWrapper>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">Editing Journal Post</h2>
        <div className="journal-lines my-5 whitespace-pre-wrap">
          <p className="font-light text-gray-600">
            {dayjs(post.createdAt).format('MMMM DD, YYYY')}
          </p>
          <p>Dear Journal,</p>
          <textarea
            rows={10}
            className="journal-lines w-full !p-0"
            value={textInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setTextInput(event.target.value)
            }
            disabled={isPosting}
          />
        </div>
      </div>
      <button
        className="flex w-40 items-center justify-center rounded-lg bg-black-pearl-600 p-4 text-white"
        onClick={() => {
          mutate({ id: post.id, content: textInput });
        }}
        disabled={isPosting}
      >
        {isPosting && <LoadingSpinner size={20} />}
        {!isPosting && 'Create Post'}
      </button>
    </ContentWrapper>
  );
}

const EditPostPage: NextPage<{ id: string }> = ({ id }) => {
  const postRes = trpc.posts.getById.useQuery({ id });

  if (postRes.data == null) {
    if (postRes.isLoading) {
      return <LoadingPage />;
    } else {
      return <Custom404Page />;
    }
  }

  return (
    <ContentWrapper>
      <EditPostView post={postRes.data} />
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
