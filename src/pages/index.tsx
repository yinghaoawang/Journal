import { LoadingSpinner } from '~/components/loading';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import UserPage from './user/[slug]';

export const LandingPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-[url('/landing-pic.jpg')] bg-cover">
      <div className="flex w-full max-w-[600px] flex-col items-center gap-6 rounded-xl bg-gray-100/90 p-10 text-center text-gray-900">
        <h1 className="text-5xl font-bold">Take control of your life goals</h1>
        <p className="text-xl">
          Journaling is a technique that’s been successfully used for mental
          health therapy worldwide. It’s proven to have immense benefits for
          your mental health. Many people are unaware that it also has benefits
          for your physical health as well.
        </p>
        <div className="landing-sign-in-button-container">
          <SignInButton>Begin Journaling</SignInButton>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingSpinner className="h-screen" />;
  }

  if (user == null) {
    return <LandingPage />;
  }

  return <UserPage id={user.id} />;
}
