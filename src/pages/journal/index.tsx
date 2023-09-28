import { useUser } from '@clerk/nextjs';
import Custom404Page from '../404';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import JournalView from '~/components/journal-view';
import Layout from '~/components/layout';

const JournalPageContent = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({
    userId
  });
  if (isLoading) return <LoadingPage />;
  if (user == null) return <Custom404Page />;

  return <JournalView user={user} />;
};

export default function JournalPage() {
  const { user: authUser, isLoaded } = useUser();
  if (!isLoaded) return <LoadingPage />;
  if (authUser == null) return <Custom404Page />;
  return (
    <Layout>
      <JournalPageContent userId={authUser.id} />
    </Layout>
  );
}
