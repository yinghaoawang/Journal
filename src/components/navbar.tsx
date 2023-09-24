'use client';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
export default function Navbar() {
  const { user, isSignedIn } = useUser();
  return (
    <div className="bg-black-pearl-900 flex h-[60px] items-center justify-between">
      <div className="mx-5 flex space-x-5">
        <div className="flex items-center gap-2">
          <Image src="/journal.svg" width={30} height={60} alt="Logo" />
          <span>Journal</span>
        </div>
      </div>
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
