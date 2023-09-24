'use client';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
export default function Navbar() {
  const { user, isSignedIn } = useUser();
  return (
    <div className="bg-black-pearl-900 flex h-[var(--navbar-height)] items-center justify-between">
      <div className="mx-5 flex space-x-5">
        <Link className="flex items-center gap-2" href="/">
          <Image src="/journal.svg" width={30} height={60} alt="Logo" />
          <span>Journal</span>
        </Link>
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
