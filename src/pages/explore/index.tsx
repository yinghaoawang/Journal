import { getAuth } from '@clerk/nextjs/server';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { type GetServerSideProps } from 'next';
import superjson from 'superjson';
import FeedLayout from '~/components/layouts/feed/feed-layout';
import { LoadingPage } from '~/components/loading';
import FeedContentView from '~/components/post-views/feed-content-view';
import { appRouter } from '~/server/trpc/root';
import { type FeedContent } from '~/server/trpc/routers/feed';
import { trpc } from '~/utils/trpc';
import { db } from '~/server/db';
import { type FilteredUser } from '~/server/trpc/routers/users';

const ExploreContent = ({ feedContents }: { feedContents: FeedContent[] }) => {
  return (
    <div>
      {feedContents != null && feedContents.length === 0 && (
        <span className="mt-[-1rem] italic">
          Uh oh! There are no public users with posts.
        </span>
      )}
      <FeedContentView
        className="flex flex-col gap-8"
        feedContents={feedContents}
      />
    </div>
  );
};

export default function ExplorePage({
  authUser,
  followingUsers
}: {
  authUser: FilteredUser;
  followingUsers: FilteredUser[];
}) {
  const { data: feedContents, isLoading: isFeedLoading } =
    trpc.feed.getExploreFeed.useQuery();

  if (isFeedLoading) {
    return <LoadingPage />;
  }

  if (feedContents == null) throw new Error('Feed is null');
  return (
    <FeedLayout
      authUser={authUser}
      followingUsers={followingUsers}
      className="pb-10"
    >
      <h2 className="mb-6 text-2xl font-bold">Public Users</h2>
      <ExploreContent feedContents={feedContents} />
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

  const authUser = await helpers.users.getDetailedUserById.fetch({
    userId: authUserId
  });

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
