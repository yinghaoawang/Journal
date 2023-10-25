import { type FilteredUser } from '~/server/trpc/routers/users';
import cn from 'classnames';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { useUser } from '@clerk/nextjs';
import { trpc } from '~/utils/trpc';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '~/components/loading';

export default function FollowUserButton({
  user,
  useIcons,
  className
}: {
  user: FilteredUser;
  useIcons?: boolean;
  className?: string;
}) {
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
}
