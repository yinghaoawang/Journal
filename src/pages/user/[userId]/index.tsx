import type { GetStaticProps } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import { LoadingSpinner } from '~/components/loading';
import Image from 'next/image';
import { type User } from '@clerk/nextjs/dist/types/server';
import cn from 'classnames';
import { useUser } from '@clerk/nextjs';
import Layout from '~/components/layouts/layout';
import Custom404Page from '~/pages/404';
import Link from 'next/link';
import PostCarouselView from '~/components/post-views/post-carousel-view';
import toast from 'react-hot-toast';
import { ChangeEvent, useEffect, useState } from 'react';

const FollowUserButton = ({ user }: { user: User }) => {
  const { user: authUser } = useUser();
  const isCurrentUser = authUser?.id == user.id;
  const utils = trpc.useContext();
  const { mutate: followUser, isLoading: isFollowLoading } =
    trpc.follows.followUser.useMutation({
      onSuccess: () => {
        toast.success(`You followed ${user.firstName}`);
        void utils.follows.invalidate();
      },
      onError: (error) => {
        if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error(`Failed to follow ${user.firstName}!`);
        }
      }
    });

  const { mutate: unfollowUser, isLoading: isUnfollowLoading } =
    trpc.follows.unfollowUser.useMutation({
      onSuccess: () => {
        toast.success(`You unfollowed ${user.firstName}`);
        void utils.follows.invalidate();
      },
      onError: (error) => {
        if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error(`Failed to unfollow ${user.firstName}!`);
        }
      }
    });

  const { data: isFollowing, isLoading: followCheckLoading } =
    trpc.follows.isFollowingById.useQuery({
      followingUserId: user.id
    });

  const isLoading = followCheckLoading || isFollowLoading || isUnfollowLoading;

  let colorClass = 'bg-green-500 text-gray-200';
  if (isFollowing) colorClass = 'bg-red-600 text-gray-100';
  else if (isCurrentUser) colorClass = 'bg-gray-300 text-gray-400';

  return (
    <button
      onClick={() => {
        if (authUser == null) {
          alert('You must be signed in to follow.');
        } else {
          if (isFollowing) {
            unfollowUser({ followingUserId: user.id });
          } else {
            followUser({ followingUserId: user.id });
          }
        }
      }}
      disabled={isCurrentUser || isLoading}
      className={cn(
        'flex h-10 w-full items-center justify-center rounded-md px-5 py-2 font-semibold',
        colorClass
      )}
    >
      {isLoading && <LoadingSpinner size={15} />}
      {!isLoading && !isFollowing && 'Follow'}
      {!isLoading && isFollowing && 'Unfollow'}
    </button>
  );
};

const UserFollowStats = ({ user }: { user: User }) => {
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
    <div className="flex flex-col gap-3">
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
      <div className="flex justify-center">
        <FollowUserButton user={user} />
      </div>
    </div>
  );
};

const UserDescription = ({ user }: { user: User }) => {
  const { user: authUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState<string>('');
  useEffect(() => {
    setDescription(
      (user.publicMetadata?.description as string) ??
        'This user is awfully quiet.'
    );
  }, [user]);
  const { mutate: updateDescription, isLoading: isUpdating } =
    trpc.profile.updateDescription.useMutation({
      onSuccess: () => {
        setIsEditing(false);
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

const UserDetails = ({ user }: { user: User }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col justify-between gap-0 sm:flex-row sm:gap-10">
        <div className="flex justify-center sm:justify-start">
          <Image
            className="rounded-full"
            src={user.imageUrl}
            alt="Profile Image"
            width={120}
            height={120}
          />
        </div>
        <UserFollowStats user={user} />
      </div>
      <div>
        <UserDescription user={user} />
      </div>
    </div>
  );
};

const UserPage = ({ user }: { user: User }) => {
  if (user == null) return <Custom404Page />;

  return (
    <Layout>
      <section className="border-b border-b-gray-300 pb-12">
        <h1 className="mb-4 flex justify-center text-2xl font-bold sm:justify-start">
          {user.username ?? user.firstName}&apos;s Profile
        </h1>
        <UserDetails user={user} />
      </section>
      <section className="flex gap-4 border-b border-b-gray-300 py-3">
        <Link href={`/user/${user.id}/journal/all`} className="text-blue-500">
          all posts view
        </Link>
        <Link href={`/user/${user.id}/journal/`} className="text-blue-500">
          single post view
        </Link>
      </section>
      <PostCarouselView className="mt-12" user={user} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const userId = context.params?.userId;
  if (typeof userId !== 'string') throw new Error('No userId in search params');

  const user = await helpers.users.getById.fetch({ userId });

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)) as User
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
