import { useUser } from '@clerk/nextjs';
import UserPage from '../user/[slug]';
import Custom404Page from '../404';
import { LoadingPage } from '~/components/loading';

export default function JournalPage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <LoadingPage />;
  if (user == null) return <Custom404Page />;

  return <UserPage id={user?.id} />;
}
