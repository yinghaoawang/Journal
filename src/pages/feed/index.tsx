import { clerkClient } from '@clerk/nextjs';
import { type User, getAuth } from '@clerk/nextjs/server';
import { type NextRequest } from 'next/server';
import Layout from '~/components/layouts/layout';
import { LoadingSpinner } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Custom404Page from '../404';

export default function DashboardPage({ authUser }: { authUser: User }) {
  const FeedContent = () => {
    const { data: feedContent, isLoading: isFeedLoading } =
      trpc.feed.getFeed.useQuery();

    if (isFeedLoading) {
      return <LoadingSpinner />;
    }

    if (feedContent == null) throw new Error('Feed is null');
    return (
      <div>
        {feedContent.map(({ user, post }) => (
          <div key={post.id}>
            <div>
              {user?.firstName} {user.lastName}
            </div>
            <div>{post.content}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold">Your Feed</h2>
      <FeedContent />
    </Layout>
  );
}

export const getServerSideProps = async ({ req }: { req: NextRequest }) => {
  const { userId } = getAuth(req);
  const user = userId ? await clerkClient.users.getUser(userId) : null;

  return {
    props: {
      authUser: JSON.parse(JSON.stringify(user)) as User
    }
  };
};
