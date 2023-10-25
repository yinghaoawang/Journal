import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { FeedContent } from '~/server/trpc/routers/feed';
import FeedContentView from '~/components/post-views/feed-content-view';
import FeedLayout from '~/components/layouts/feed/feed-layout';
import { type GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import superjson from 'superjson';
import { type FilteredUser } from '~/server/trpc/routers/users';
import { db } from '~/server/db';

const FeedContent = ({ feedContents }: { feedContents: FeedContent[] }) => {
  return (
    <div>
      {feedContents != null && feedContents.length === 0 && (
        <span className="mt-[-1rem] italic">
          You aren&apos;t following anybody, visit the&nbsp;
          <Link className="text-blue-500" href={'/explore'}>
            explore page
          </Link>
          &nbsp;to discover users!
        </span>
      )}
      <FeedContentView
        className="flex flex-col gap-8"
        feedContents={feedContents}
      />
    </div>
  );
};

export default function FeedPage({
  authUser,
  followingUsers
}: {
  authUser: FilteredUser;
  followingUsers: FilteredUser[];
}) {
  const { data: feedContents, isLoading: isFeedLoading } =
    trpc.feed.getFeed.useQuery();

  if (isFeedLoading) {
    return <LoadingPage />;
  }

  if (feedContents == null) throw new Error('Feed is null');
  return (
    <FeedLayout
      followingUsers={followingUsers}
      authUser={authUser}
      className="pb-10"
    >
      <h2 className="mb-6 text-2xl font-bold">Your Feed</h2>
      <FeedContent feedContents={feedContents} />
    </FeedLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { userId: authUserId } = getAuth(req);
  if (!authUserId) throw new Error('Auth user ID does not exist');
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: authUserId },
    transformer: superjson
  });

  const authUser = await helpers.users.getById.fetch({ userId: authUserId });

  const followingUsers = await helpers.follows.getAuthFollowingUsers.fetch();

  return {
    props: {
      authUser: JSON.parse(JSON.stringify(authUser)) as FilteredUser,
      followingUsers: JSON.parse(
        JSON.stringify(followingUsers)
      ) as FilteredUser[]
    }
  };
};
