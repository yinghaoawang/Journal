import dayjs from '~/utils/dayjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import type { Post } from '@prisma/client';
import { LoadingSpinner } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import { type FilteredUser } from '~/server/trpc/routers/users';
import { UserIsPrivateText } from '../utils';
import { MDXEditor } from '../mdx/mdx-editor';
import { READONLY_PLUGINS } from '../mdx/_boilerplate';

const UserActionLinks = ({ post }: { post: Post }) => {
  const utils = trpc.useContext();
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

  const handleDeletePostClick = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (confirmed) {
      deletePost({ id });
    }
  };
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

export default function PostCarouselView({
  user,
  className
}: {
  user: FilteredUser;
  className?: string;
}) {
  const [currentPostIndex, setCurrentPostIndex] = useState(-1);
  const [currentPost, setCurrentPost] = useState<Post>();
  const { user: authUser } = useUser();
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
    const clampedIndex = Math.min(
      Math.max(currentPostIndex, 0),
      posts.length - 1
    );
    setCurrentPost(posts[clampedIndex]);
  }, [currentPostIndex, posts]);

  const { data: isProfileHidden } = trpc.profile.isUserHiddenToAuth.useQuery({
    userId: user.id
  });
  const isCurrentUser = user.id === authUser?.id;

  if (isProfileHidden) {
    return (
      <UserIsPrivateText className="mt-4 flex flex-col justify-center text-center" />
    );
  }

  if (isLoading) {
    return <LoadingSpinner className="mt-10" />;
  }

  return (
    <>
      <div className={cn('flex justify-between', className)}>
        <h2 className="flex items-end pb-1 text-2xl font-bold">
          {isCurrentUser ? 'My' : `${user?.displayName ?? user.firstName}'s`}
          &nbsp;Journal Posts
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
      {isLoading && <LoadingSpinner />}
      {!isLoading && posts?.length === 0 && (
        <span className="mt-4 italic">
          {isCurrentUser
            ? "You don't have any posts, you should create one!"
            : user?.displayName ?? user.firstName + " doesn't have any posts."}
        </span>
      )}
      {currentPost && (
        <div className="my-5 flex flex-col">
          <div className="flex justify-between">
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
          </div>

          <h2 className="my-4 font-bold">
            {dayjs(currentPost?.createdAt ?? Date.now()).format(
              'MMMM DD, YYYY'
            )}
          </h2>
          <div className="rounded-lg border border-gray-300">
            <MDXEditor
              key={currentPost.id}
              contentEditableClassName="prose"
              markdown={currentPost.content}
              autoFocus={true}
              readOnly={true}
              plugins={READONLY_PLUGINS}
            />
          </div>
        </div>
      )}
    </>
  );
}
