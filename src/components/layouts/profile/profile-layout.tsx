import Head from 'next/head';
import type { ReactNode } from 'react';
import Navbar from '~/components/layouts/navbar';
import Footer from '~/components/layouts/footer';
import { type FilteredUser } from '~/server/trpc/routers/users';
import toast from 'react-hot-toast';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { trpc } from '~/utils/trpc';
import { LoadingSpinner } from '~/components/loading';
import Image from 'next/image';
import cn from 'classnames';
import { useUser } from '@clerk/nextjs';
import { type ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import ReactSlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import { SidebarContext } from '~/contexts/sidebar-context';
import { useContext } from 'react';

const UserDetails = ({ user }: { user: FilteredUser }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col justify-between">
        <div className="flex justify-center">
          <Image
            className="rounded-full"
            src={user.imageUrl}
            alt="Profile Image"
            width={120}
            height={120}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="flex justify-center text-2xl font-bold">
          {user?.displayName ?? user.firstName}
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

export const FollowUserButton = ({
  user,
  useIcons,
  className
}: {
  user: FilteredUser;
  useIcons?: boolean;
  className?: string;
}) => {
  const { user: authUser, isLoaded: isAuthUserLoaded } = useUser();
  const isCurrentUser = authUser?.id == user.id;
  const utils = trpc.useContext();
  const followText = useIcons ? (
    <span className="relative left-[1px]">
      <FaUserPlus />
    </span>
  ) : (
    'Follow'
  );
  const unfollowText = useIcons ? (
    <span className="relative left-[1px]">
      <FaUserMinus />
    </span>
  ) : (
    'Unfollow'
  );
  const { mutate: followUser, isLoading: isFollowLoading } =
    trpc.follows.followUser.useMutation({
      onSuccess: () => {
        toast.success(`You followed ${user?.displayName ?? user.firstName}`);
        void utils.follows.invalidate();
      },
      onError: (error) => {
        if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error(
            `Failed to follow ${user?.displayName ?? user.firstName}!`
          );
        }
      }
    });

  const { mutate: unfollowUser, isLoading: isUnfollowLoading } =
    trpc.follows.unfollowUser.useMutation({
      onSuccess: () => {
        toast.success(`You unfollowed ${user?.displayName ?? user.firstName}`);
        void utils.follows.invalidate();
      },
      onError: (error) => {
        if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error(
            `Failed to unfollow ${user?.displayName ?? user.firstName}!`
          );
        }
      }
    });

  const { data: isFollowing, isLoading: followCheckLoading } =
    trpc.follows.isAuthFollowingUser.useQuery({
      followingUserId: user.id
    });

  const isLoading =
    followCheckLoading ||
    isFollowLoading ||
    isUnfollowLoading ||
    !isAuthUserLoaded;

  return (
    <button
      onClick={(event) => {
        event.preventDefault();
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
        'button flex items-center justify-center rounded-md font-semibold',
        useIcons ? 'h-8 w-8 !p-0' : 'h-12 w-40 px-5 py-2',
        isFollowing && '!bg-red-500 !text-gray-100 hover:!bg-red-500/90',
        className
      )}
    >
      {isLoading && <LoadingSpinner size={15} />}
      {!isLoading && !isFollowing && followText}
      {!isLoading && isFollowing && unfollowText}
    </button>
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

const ProfileSidebar = ({
  user,
  className
}: {
  user: FilteredUser;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'shrink-0 border-r border-r-gray-300 bg-white px-8 py-4',
        className
      )}
    >
      <UserDetails user={user} />
      <section className="mt-4 flex justify-center border-b border-b-gray-300 py-3">
        <Link href={`/user/${user.id}/journal/all`} className="text-blue-500">
          all posts
        </Link>
      </section>
      <section className="flex justify-center border-b border-b-gray-300 py-3">
        <Link href={`/user/${user.id}/journal/`} className="text-blue-500">
          single post
        </Link>
      </section>
    </div>
  );
};

export default function ProfileLayout({
  children,
  user,
  className
}: {
  children: ReactNode;
  user: FilteredUser;
  className?: string;
}) {
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  return (
    <>
      <Head>
        <title>It&apos;s not a Diary</title>
        <meta name="description" content="It's a Journal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navbar showMenu={true} />
        <div className="flex flex-1 grow justify-center">
          <ReactSlidingPane
            isOpen={isOpen}
            from="left"
            width="350px"
            onRequestClose={() => setIsOpen(false)}
          >
            <ProfileSidebar user={user} />
          </ReactSlidingPane>
          <ProfileSidebar className="hidden w-[350px] lg:block" user={user} />
          <div
            className={cn(
              'mt-4 flex w-full max-w-[1000px] flex-col px-10',
              className
            )}
          >
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
