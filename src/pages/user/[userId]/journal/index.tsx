import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Layout from '~/components/layouts/layout';
import Custom404Page from '~/pages/404';
import { useRouter } from 'next/router';
import PostCarouselView from '~/components/post-views/post-carousel-view';

const JournalPageContent = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({
    userId
  });

  if (isLoading) return <LoadingPage />;
  if (user == null) return <Custom404Page />;

  return (
    <Layout>
      <PostCarouselView user={user} />
    </Layout>
  );
};

export default function UserJournalSinglePage({ userId }: { userId?: string }) {
  const router = useRouter();
  if (userId == null) {
    const { userId: paramsUserId } = router.query;
    userId = Array.isArray(paramsUserId) ? paramsUserId[0] : paramsUserId;
  }

  if (userId == null) return <LoadingPage />;
  return <JournalPageContent userId={userId} />;
}
