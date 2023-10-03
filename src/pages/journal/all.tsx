import { useUser } from '@clerk/nextjs';
import { LoadingPage } from '~/components/loading';
import Custom404Page from '~/pages/404';
import UserJournalAllPage from '../user/[slug]/journal/all';

export default function CurrUserJournalAllPage() {
  const { user: authUser, isLoaded } = useUser();
  if (!isLoaded) return <LoadingPage />;
  if (authUser == null) return <Custom404Page />;
  return <UserJournalAllPage userId={authUser.id} />;
}
