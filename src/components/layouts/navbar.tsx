'use client';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Bad_Script } from 'next/font/google';
import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import {
  LuLogOut,
  LuSettings,
  LuCompass,
  LuUserCircle2,
  LuNewspaper,
  LuMenu
} from 'react-icons/lu';
import { useContext } from 'react';
import { SidebarContext } from '~/contexts/sidebar-context';

const logoFont = Bad_Script({ subsets: ['latin'], weight: '400' });

export default function Navbar({ showMenu }: { showMenu?: boolean }) {
  const { setIsOpen } = useContext(SidebarContext);
  const { user, isSignedIn } = useUser();
  const displayName =
    (user?.publicMetadata?.displayName as string) ?? user?.firstName;
  return (
    <>
      <div className="fixed flex h-[var(--navbar-height)] w-full items-center justify-between bg-white text-gray-600 lg:relative">
        <div>
          <div
            className={cn(
              'mx-5 hidden space-x-5 lg:flex',
              !showMenu && '!flex'
            )}
          >
            <Link
              className={cn('flex items-center gap-3', logoFont.className)}
              href="/"
            >
              <Image src="/journal.svg" width={25} height={60} alt="Logo" />
              <span className="hidden pt-2 text-2xl font-semibold sm:inline-block">
                Journal
              </span>
            </Link>
          </div>
          {showMenu && (
            <button
              onClick={() => setIsOpen(true)}
              className="mx-5 block w-full grow lg:hidden"
            >
              <LuMenu size={22} />
            </button>
          )}
        </div>
        <div className="mx-5 flex items-center space-x-10 sm:space-x-5">
          {!isSignedIn && <SignInButton />}
          {isSignedIn && (
            <>
              <Link href={`/user/${user.id}`}>
                <div className="flex items-center">
                  <LuUserCircle2 size={22} className="sm:hidden" />
                  <span className="hidden sm:inline-block">
                    Hi {displayName}!
                  </span>
                </div>
              </Link>
              <Link href="/feed">
                <div className="flex items-center">
                  <LuNewspaper size={22} className="sm:hidden" />
                  <span className="hidden sm:inline-block">Feed</span>
                </div>
              </Link>
              <Link href="/explore">
                <div className="flex items-center">
                  <LuCompass size={22} className="sm:hidden" />
                  <span className="hidden sm:inline-block">Explore</span>
                </div>
              </Link>
              <Link href="/settings">
                <div className="flex items-center">
                  <LuSettings size={22} className="sm:hidden" />
                  <span className="hidden sm:inline-block">Settings</span>
                </div>
              </Link>
              <SignOutButton>
                <div className="flex items-center">
                  <LuLogOut size={22} className="sm:hidden" />
                  <span className="hidden sm:inline-block">Sign Out</span>
                </div>
              </SignOutButton>
            </>
          )}
        </div>
      </div>
      <div className="mt-[var(--navbar-height)] lg:hidden"></div>
    </>
  );
}
