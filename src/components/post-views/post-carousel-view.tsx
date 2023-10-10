import type { User } from '@clerk/nextjs/dist/types/server';
import dayjs from '~/utils/dayjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import type { Post } from '@prisma/client';
import { LoadingSpinner } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import cn from 'classnames';
import { useEffect, useState } from 'react';

export default function PostCarouselView({
  user,
  className
}: {
  user: User;
  className?: string;
}) {
  const [currentPostIndex, setCurrentPostIndex] = useState(-1);
  const [currentPost, setCurrentPost] = useState<Post>();
  const { user: authUser } = useUser();
  const utils = trpc.useContext();
  const { data: posts, isLoading } = trpc.posts.getByUserId.useQuery(
    {
      userId: user.id,
      orderBy: 'desc'
    },
    {
      onSuccess: () => {
        setCurrentPostIndex(0);
      }
    }
  );

  useEffect(() => {
    if (posts == null) {
      return;
    }
    if (currentPostIndex < 0) {
      setCurrentPostIndex(0);
      return;
    }
    if (currentPostIndex > posts.length - 1) {
      console.error('currentPostIndex is out of bounds');
      setCurrentPostIndex(posts.length - 1);
      return;
    }
    setCurrentPost(posts[currentPostIndex]);
  }, [currentPostIndex, posts]);

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
    return <LoadingSpinner className="mt-10" />;
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

  return (
    <>
      <div className={cn('flex justify-between', className)}>
        <h2 className="flex items-end pb-1 text-2xl font-bold">
          {isCurrentUser ? 'My' : `${user.firstName}'s`} Journal Posts
        </h2>
        {isCurrentUser && (
          <>
            <Link
              className="button hidden !py-4 sm:block"
              href="/journal/post/new"
            >
              Create New Post
            </Link>
            <Link
              className="button block !py-4 sm:hidden"
              href="/journal/post/new"
            >
              +
            </Link>
          </>
        )}
      </div>
      {currentPost == null && <LoadingSpinner />}
      {currentPost && (
        <div className="my-5 flex flex-col">
          <div className="flex gap-3">
            <button
              className={cn(
                currentPostIndex - 1 < 0 ? 'text-blue-200' : 'text-blue-500'
              )}
              disabled={currentPostIndex - 1 < 0}
              onClick={() => setCurrentPostIndex(currentPostIndex - 1)}
            >
              prev
            </button>
            <button
              className={cn(
                posts != null && currentPostIndex + 1 > posts.length - 1
                  ? 'text-blue-200'
                  : 'text-blue-500'
              )}
              disabled={
                posts != null && currentPostIndex + 1 > posts.length - 1
              }
              onClick={() => setCurrentPostIndex(currentPostIndex + 1)}
            >
              next
            </button>
          </div>
          {isCurrentUser && <UserActionLinks post={currentPost} />}
          <div className="journal">
            <h2>{dayjs(currentPost.createdAt).format('MMMM DD, YYYY')}</h2>
            <p>Dear Journal,</p>
            <p>{currentPost.content}</p>
          </div>
        </div>
      )}
    </>
  );
}
