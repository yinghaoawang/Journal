import type { User } from '@clerk/nextjs/dist/types/server';
import dayjs from '~/utils/dayjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import type { Post } from '@prisma/client';
import { LoadingSpinner } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import cn from 'classnames';

export default function AllPostsView({ user }: { user: User }) {
  const { user: authUser } = useUser();
  const utils = trpc.useContext();
  const { data: posts, isLoading } = trpc.posts.getByUserId.useQuery({
    userId: user.id,
    orderBy: 'desc'
  });

  const { mutate: deletePost } = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success('Post deleted successfully!');
      void utils.posts.invalidate();
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

  if (isLoading) {
    return <LoadingSpinner className="content-height" />;
  }

  const isCurrentUser = user.id === authUser?.id;

  const handleDeletePostClick = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (confirmed) {
      deletePost({ id });
    }
  };

  const UserActionLinks = ({ post }: { post: Post }) => {
    return (
      <div className="mr-5 flex justify-end gap-2">
        <Link className="text-blue-500" href={`/journal/post/edit/${post.id}`}>
          edit
        </Link>
        <button
          onClick={() => handleDeletePostClick(post.id)}
          className="text-blue-500"
        >
          delete
        </button>
      </div>
    );
  };

  const createLinkClass =
    'rounded-md bg-green-500 px-5 py-3 font-semibold text-gray-200';

  return (
    <>
      <div className="flex justify-between">
        <h2 className="flex items-end pb-1 text-2xl font-bold">
          {isCurrentUser ? 'My' : `${user.firstName}'s`} Journal Posts
        </h2>
        {isCurrentUser && (
          <>
            <Link
              className={cn('hidden sm:block', createLinkClass)}
              href="/journal/post/new"
            >
              Create New Post
            </Link>
            <Link
              className={cn('block sm:hidden', createLinkClass)}
              href="/journal/post/new"
            >
              +
            </Link>
          </>
        )}
      </div>
      {posts?.map((post) => (
        <div
          className="mt-10 flex flex-col border-b-[3px] border-b-gray-600 pb-12"
          key={post.id}
        >
          {isCurrentUser && <UserActionLinks post={post} />}
          <div className="journal-lines whitespace-pre-wrap">
            <p className="font-bold">
              {dayjs(post.createdAt).format('MMMM DD, YYYY')}
            </p>
            <p>Dear Journal,</p>
            <p>{post.content}</p>
          </div>
        </div>
      ))}
    </>
  );
}
