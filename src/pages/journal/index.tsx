import { useUser } from '@clerk/nextjs';
import { LoadingPage } from '~/components/loading';
import Custom404Page from '~/pages/404';
import UserJournalSinglePage from '../user/[slug]/journal';

export default function CurrUserJournalSinglePage() {
  const { user: authUser, isLoaded } = useUser();
  if (!isLoaded) return <LoadingPage />;
  if (authUser == null) return <Custom404Page />;
  return <UserJournalSinglePage userId={authUser.id} />;
}
