'use client';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
export default function Navbar() {
  const { user, isSignedIn } = useUser();
  return (
    <div className="bg-black-pearl-900 flex h-[60px] items-center justify-between">
      <div className="mx-5 flex space-x-5">LOGO HERE</div>
      <div className="mx-5 flex space-x-5">
        {!isSignedIn && <SignInButton />}
        {isSignedIn && (
          <>
            <div>Hi {user?.firstName}!</div>
            <div>My Journal</div>
            <SignOutButton />
          </>
        )}
      </div>
    </div>
  );
}
