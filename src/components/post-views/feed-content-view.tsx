import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { type FeedContent } from '~/server/trpc/routers/feed';
import dayjs from '~/utils/dayjs';

export default function FeedContentView({
  feedContents,
  className
}: {
  feedContents: FeedContent[];
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {feedContents.map(({ user, post }) => (
        <div key={post.id} className="rounded-lg border border-gray-300 p-4">
          <div className="mb-2 flex flex-col">
            <div className="mb-1 flex items-center gap-3">
              <Link href={`/user/${user.id}`}>
                <Image
                  className="rounded-full"
                  alt={`${user?.displayName ?? user.firstName}'s pfp`}
                  height={40}
                  width={40}
                  src={user.imageUrl}
                />
              </Link>
              <Link href={`/user/${user.id}`}>
                {user?.displayName
                  ? user.displayName
                  : `${user?.firstName} ${user?.lastName ?? ''}`}
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              {post.createdAt.getTime() === post.updatedAt.getTime() ? (
                <span>Posted {dayjs(post.createdAt).fromNow()}</span>
              ) : (
                <span>Updated {dayjs(post.updatedAt).fromNow()}</span>
              )}
            </span>
          </div>
          <div className="max-h-[400px] overflow-auto">
            <div className="journal">
              <h2>{dayjs(post.createdAt).format('MMMM DD, YYYY')}</h2>
              <p>Dear Journal,</p>
              <p>{post.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}