'use client';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Bad_Script } from 'next/font/google';
import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';

const logoFont = Bad_Script({ subsets: ['latin'], weight: '400' });

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  return (
    <div className="flex h-[var(--navbar-height)] items-center justify-between bg-black-pearl-900 text-gray-200">
      <div className="mx-5 flex space-x-5">
        <Link
          className={cn('flex items-center gap-3', logoFont.className)}
          href="/"
        >
          <Image src="/journal.svg" width={25} height={60} alt="Logo" />
          <span className="pt-2 text-2xl font-semibold text-black">
            Journal
          </span>
        </Link>
      </div>
      <div className="mx-5 flex space-x-5">
        {!isSignedIn && <SignInButton />}
        {isSignedIn && (
          <>
            <Link href={`/user/${user.id}`}>Hi {user?.firstName}!</Link>
            <Link href="/journal">My Journal</Link>
            <Link href="/journal/new">New Entry</Link>
            <SignOutButton />
          </>
        )}
      </div>
    </div>
  );
}
