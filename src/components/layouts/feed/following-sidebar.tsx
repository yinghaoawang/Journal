import Image from 'next/image';
import Link from 'next/link';
import FollowUserButton from '../profile/follow-user-button';
import { type FilteredUser } from '~/server/trpc/routers/users';
import cn from 'classnames';

const FollowCard = ({ user }: { user: FilteredUser }) => {
  return (
    <section className="flex flex-col border-b border-b-gray-300 px-4 py-2 hover:bg-gray-100/80">
      <Link
        href={`/user/${user.id}`}
        className="flex items-center justify-between"
      >
        <div className="flex items-center">
          <Image
            className="rounded-full"
            src={user.imageUrl}
            alt="Profile Image"
            width={40}
            height={40}
          />
          <h4 className="flex justify-center p-4 font-bold">
            {user?.displayName ?? user.firstName}
          </h4>
        </div>
        <FollowUserButton
          className="!rounded-full"
          useIcons={true}
          user={user}
        />
      </Link>
    </section>
  );
};

export default function FollowingSidebar({
  followingUsers,
  className
}: {
  followingUsers: FilteredUser[];
  className?: string;
}) {
  return (
    <div className={cn('shrink-0 px-4 py-4', className)}>
      <h1 className="mb-2 flex justify-center text-2xl font-bold">Following</h1>
      {followingUsers.map((user) => (
        <FollowCard key={user.id} user={user} />
      ))}
    </div>
  );
}
