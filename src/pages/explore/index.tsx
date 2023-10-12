import Layout from '~/components/layouts/layout';
import { LoadingPage } from '~/components/loading';
import FeedContentView from '~/components/post-views/feed-content-view';
import { type FeedContent } from '~/server/trpc/routers/feed';
import { trpc } from '~/utils/trpc';

const ExploreContent = ({ feedContents }: { feedContents: FeedContent[] }) => {
  return (
    <div className="flex flex-col gap-8">
      {feedContents != null && feedContents.length === 0 && (
        <span className="mt-[-1rem] italic">
          Uh oh! There are no public users with posts.
        </span>
      )}
      <FeedContentView feedContents={feedContents} />
    </div>
  );
};

export default function ExplorePage() {
  const { data: feedContents, isLoading: isFeedLoading } =
    trpc.feed.getExploreFeed.useQuery();

  if (isFeedLoading) {
    return <LoadingPage />;
  }

  if (feedContents == null) throw new Error('Feed is null');
  return (
    <Layout className="pb-10">
      <h2 className="mb-6 text-2xl font-bold">Public Users</h2>
      <ExploreContent feedContents={feedContents} />
    </Layout>
  );
}
