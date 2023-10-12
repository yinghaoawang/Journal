import Layout from '~/components/layouts/layout';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { FeedContent } from '~/server/trpc/routers/feed';
import FeedContentView from '~/components/post-views/feed-content-view';

const FeedContent = ({ feedContents }: { feedContents: FeedContent[] }) => {
  return (
    <div className="flex flex-col gap-8">
      {feedContents != null && feedContents.length === 0 && (
        <span className="mt-[-1rem] italic">
          You aren&apos;t following anybody, visit the&nbsp;
          <Link className="text-blue-500" href={'/explore'}>
            explore page
          </Link>
          &nbsp;to discover users!
        </span>
      )}
      <FeedContentView feedContents={feedContents} />
    </div>
  );
};

export default function FeedPage() {
  const { data: feedContents, isLoading: isFeedLoading } =
    trpc.feed.getFeed.useQuery();

  if (isFeedLoading) {
    return <LoadingPage />;
  }

  if (feedContents == null) throw new Error('Feed is null');
  return (
    <Layout className="pb-10">
      <h2 className="mb-6 text-2xl font-bold">Your Feed</h2>
      <FeedContent feedContents={feedContents} />
    </Layout>
  );
}
