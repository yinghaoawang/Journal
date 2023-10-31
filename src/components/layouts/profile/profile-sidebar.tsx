import toast from 'react-hot-toast';
import { trpc } from '~/utils/trpc';
import { LoadingSpinner } from '~/components/loading';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { type ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { type FilteredUser } from '~/server/trpc/routers/users';
import cn from 'classnames';
import FollowUserButton from './follow-user-button';

const UserDetails = ({ user }: { user: FilteredUser }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col justify-between">
        <div className="flex justify-center">
          <Image
            className="rounded-full"
            src={user?.imageUrl ?? '/default-avatar.png'}
            alt="Profile Image"
            width={120}
            height={120}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="flex justify-center text-2xl font-bold">
          {user?.displayName ?? user?.firstName}
        </h1>
        <div className="flex flex-col items-center">
          <UserDescription user={user} />
        </div>
        <div className="flex justify-center">
          <FollowUserButton user={user} />
        </div>
      </div>
    </div>
  );
};

const UserFollowStats = ({ user }: { user: FilteredUser }) => {
  const { data: postCount, isLoading: isPostCountLoading } =
    trpc.posts.getCountByUserId.useQuery({
      userId: user.id
    });
  const { data: followerCount, isLoading: isFollowerCountLoading } =
    trpc.follows.getFollowerCount.useQuery({ userId: user.id });
  const { data: followingCount, isLoading: isFollowingCountLoading } =
    trpc.follows.getFollowingCount.useQuery({ userId: user.id });

  const itemClass = 'w-20 flex flex-col';
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="mr-3 mt-3 flex grow items-center justify-center gap-4 text-center font-semibold sm:grow-0 sm:justify-end">
        <div className={cn(itemClass)}>
          <span>
            {isPostCountLoading ? <LoadingSpinner size={16} /> : postCount}
          </span>
          Posts
        </div>
        <div className={cn(itemClass)}>
          <span>
            {isFollowerCountLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              followerCount
            )}
          </span>
          Followers
        </div>
        <div className={cn(itemClass)}>
          <span>
            {isFollowingCountLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              followingCount
            )}
          </span>
          Following
        </div>
      </div>
    </div>
  );
};

const UserDescription = ({ user }: { user: FilteredUser }) => {
  const { user: authUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState<string>('');
  useEffect(() => {
    setDescription(user?.description ?? 'This user is awfully quiet.');
  }, [user]);
  const { mutate: updateDescription, isLoading: isUpdating } =
    trpc.profile.updateDescription.useMutation({
      onSuccess: () => {
        setIsEditing(false);
        void authUser?.reload();
        toast.success('Description updated successfully!');
      },
      onError: (error) => {
        console.error(error);
        setIsEditing(false);
        toast.error('Failed to update description!');
      }
    });

  const isCurrentUser = authUser?.id === user.id;
  return (
    <>
      {!isEditing && <p>{description ?? 'This user is awfully quiet.'}</p>}
      {isEditing && (
        <>
          <textarea
            rows={3}
            className="mb-[-3px] w-full resize-none border"
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setDescription(event.target.value);
            }}
            value={description}
          />
          <button
            onClick={() => {
              updateDescription({ description });
            }}
            disabled={isUpdating}
            className="text-blue-500"
          >
            save
          </button>
        </>
      )}
      {isCurrentUser && !isEditing && (
        <button className="text-blue-500" onClick={() => setIsEditing(true)}>
          edit
        </button>
      )}
    </>
  );
};

export default function ProfileSidebar({
  user,
  className
}: {
  user: FilteredUser;
  className?: string;
}) {
  const { data: isProfileHidden, isLoading } =
    trpc.profile.isUserHiddenToAuth.useQuery({
      userId: user.id
    });
  if (isLoading) return <></>;
  return (
    <div className={cn('shrink-0 px-8 py-4', className)}>
      <UserDetails user={user} />
      {!isProfileHidden && (
        <>
          <section className="mt-4 flex justify-center border-b border-b-gray-300 py-3">
            <Link
              href={`/user/${user.id}/journal/all`}
              className="text-blue-500"
            >
              all posts
            </Link>
          </section>
          <section className="flex justify-center border-b border-b-gray-300 py-3">
            <Link href={`/user/${user.id}/journal/`} className="text-blue-500">
              single post
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
