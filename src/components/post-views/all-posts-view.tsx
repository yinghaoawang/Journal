import dayjs from '~/utils/dayjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import type { Post } from '@prisma/client';
import { trpc } from '~/utils/trpc';
import cn from 'classnames';
import { type FilteredUser } from '~/server/trpc/routers/users';
import { UserIsPrivateText } from '../utils';
import { READONLY_PLUGINS } from '../mdx/_boilerplate';
import { MDXEditor } from '../mdx/mdx-editor';

export default function AllPostsView({
  user,
  posts,
  isProfileHidden
}: {
  user: FilteredUser;
  posts: Post[];
  isProfileHidden: boolean;
}) {
  if (isProfileHidden && posts?.length > 0)
    throw new Error('Posts received for private profile');

  const { user: authUser } = useUser();
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
      <div className="flex justify-between gap-2">
        <h2 className="flex items-end pb-1 text-2xl font-bold">
          {isCurrentUser ? 'My' : `${user?.displayName ?? user.firstName}'s`}
          &nbsp;Journal Posts
        </h2>
        {isCurrentUser && (
          <div className="flex items-center">
            <Link
              className="button hidden justify-center sm:block"
              href="/journal/post/new"
            >
              Create New Post
            </Link>
            <Link className="button block sm:hidden" href="/journal/post/new">
              +
            </Link>
          </div>
        )}
      </div>
      {isProfileHidden && <UserIsPrivateText className="mt-4" />}
      {posts.map((post, index) => (
        <div
          className={cn('mt-10 flex flex-col pb-12', index < posts.length - 1)}
          key={post.id}
        >
          {isCurrentUser && <UserActionLinks post={post} />}

          <MDXEditor
            contentEditableClassName="prose"
            markdown={post.content}
            autoFocus={true}
            readOnly={true}
            plugins={READONLY_PLUGINS}
          />
        </div>
      ))}
    </>
  );
}
