import { LoadingPage } from '~/components/loading';
import { useUser } from '@clerk/nextjs';
import ContentWrapper from '~/components/content-wrapper';
import UserPage from './user/[slug]';

export const LandingPage = () => {
  return <ContentWrapper>Landing Page</ContentWrapper>;
};

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (user == null) {
    return <LandingPage />;
  }

  return <UserPage id={user.id} />;
}
