import type { Post } from '@prisma/client';
import toast from 'react-hot-toast';
import AutoResizingTextArea from '~/components/resizing-text-area';
import dayjs from '~/utils/dayjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '~/utils/trpc';
import { LoadingSpinner } from '../loading';

const MutatePostView = ({
  type,
  post
}: {
  type: 'create' | 'update';
  post?: Post;
}) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const [textInput, setTextInput] = useState(post?.content ?? '');
  const onMutateSuccess = () => {
    setTextInput('');
    toast.success(
      `Post ${type === 'create' ? 'created' : 'edited'} successfully!`
    );
    router.push('/journal');
    void utils.posts.invalidate();
  };
  const onMutateError = (errorMessage?: string) => {
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      toast.error(`Failed to ${type} post!`);
    }
  };
  const { mutate: createPost, isLoading: isCreating } =
    trpc.posts.create.useMutation({
      onSuccess: onMutateSuccess,
      onError: (error) => {
        const errors = error.data?.zodError?.fieldErrors;
        const errorMessage = errors?.[Object.keys(errors)?.[0] ?? '']?.[0];
        onMutateError(errorMessage);
      }
    });

  const { mutate: updatePost, isLoading: isUpdating } =
    trpc.posts.update.useMutation({
      onSuccess: onMutateSuccess,
      onError: (error) => {
        const errors = error.data?.zodError?.fieldErrors;
        const errorMessage = errors?.[Object.keys(errors)?.[0] ?? '']?.[0];
        onMutateError(errorMessage);
      }
    });
  const isLoading = isCreating || isUpdating;
  return (
    <>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">
          {type === 'create' ? 'Creating' : 'Editing'} Journal Post
        </h2>
        <div className="journal my-5">
          <h2>
            {dayjs(post?.createdAt ?? Date.now()).format('MMMM DD, YYYY')}
          </h2>
          <p>Dear Journal,</p>
          <AutoResizingTextArea
            className="journal-lines w-full resize-none !p-0"
            input={textInput}
            setInput={setTextInput}
            disabled={isLoading}
          />
        </div>
      </div>
      <button
        className="flex w-40 items-center justify-center rounded-lg bg-black-pearl-600 p-4 text-white"
        onClick={() => {
          if (type === 'create') {
            createPost({ content: textInput });
          } else {
            if (post == null)
              throw new Error('Post prop required for update type');

            updatePost({ id: post.id, content: textInput });
          }
        }}
        disabled={isLoading}
      >
        {isLoading && <LoadingSpinner size={20} />}
        {!isLoading && (type === 'create' ? 'Create New Post' : 'Update Post')}
      </button>
    </>
  );
};

export default MutatePostView;
