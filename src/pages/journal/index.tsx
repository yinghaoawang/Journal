import { useUser } from '@clerk/nextjs';
import Custom404Page from '../404';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import ContentWrapper from '~/components/content-wrapper';
import JournalView from '~/components/journal-view';

const JournalPageContent = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({
    userId
  });
  if (isLoading) return <LoadingPage />;
  if (user == null) return <Custom404Page />;

  return (
    <ContentWrapper>
      <JournalView user={user} />;
    </ContentWrapper>
  );
};

export default function JournalPage() {
  const { user: authUser, isLoaded } = useUser();
  if (!isLoaded) return <LoadingPage />;
  if (authUser == null) return <Custom404Page />;
  return <JournalPageContent userId={authUser.id} />;
}
