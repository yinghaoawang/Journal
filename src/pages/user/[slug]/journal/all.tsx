import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Layout from '~/components/layouts/layout';
import AllPostsView from '~/components/post-views/all-posts-view';
import Custom404Page from '~/pages/404';
import { useRouter } from 'next/router';

const JournalPageContent = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({
    userId
  });
  if (isLoading) return <LoadingPage />;
  if (user == null) return <Custom404Page />;

  return (
    <Layout>
      <AllPostsView user={user} />
    </Layout>
  );
};

export default function UserJournalAllPage({ userId }: { userId?: string }) {
  const router = useRouter();
  if (userId == null) {
    const { slug } = router.query;
    userId = Array.isArray(slug) ? slug[0] : slug;
  }

  if (userId == null) return <Custom404Page />;
  return <JournalPageContent userId={userId} />;
}
