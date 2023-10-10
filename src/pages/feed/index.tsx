import dayjs from '~/utils/dayjs';
import Image from 'next/image';
import Layout from '~/components/layouts/layout';
import { LoadingSpinner } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';

export default function DashboardPage() {
  const FeedContent = () => {
    const { data: feedContent, isLoading: isFeedLoading } =
      trpc.feed.getFeed.useQuery();

    if (isFeedLoading) {
      return <LoadingSpinner />;
    }

    if (feedContent == null) throw new Error('Feed is null');
    return (
      <div className="flex flex-col gap-8">
        {feedContent.map(({ user, post }) => (
          <div key={post.id} className="rounded-lg border border-gray-300 p-4">
            <div className="mb-2 flex flex-col">
              <div className="mb-1 flex items-center gap-3">
                <Link href={`/user/${user.id}`}>
                  <Image
                    className="rounded-full"
                    alt={`${
                      (user?.publicMetadata?.displayName as string) ??
                      user.firstName
                    }'s pfp`}
                    height={40}
                    width={40}
                    src={user.imageUrl}
                  />
                </Link>
                <Link href={`/user/${user.id}`}>
                  {(user?.publicMetadata?.displayName as string)
                    ? (user.publicMetadata.displayName as string)
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
            <div className="h-[400px] overflow-auto">
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
  };

  return (
    <Layout className="pb-10">
      <h2 className="mb-6 text-2xl font-bold">Your Feed</h2>
      <FeedContent />
    </Layout>
  );
}
