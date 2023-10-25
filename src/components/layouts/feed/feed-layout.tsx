import Head from 'next/head';
import type { ReactNode } from 'react';
import Navbar from '~/components/layouts/navbar';
import Footer from '~/components/layouts/footer';
import { type FilteredUser } from '~/server/trpc/routers/users';
import toast from 'react-hot-toast';
import { trpc } from '~/utils/trpc';
import { LoadingSpinner } from '~/components/loading';
import Image from 'next/image';
import cn from 'classnames';
import { useUser } from '@clerk/nextjs';
import { type ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import ReactSlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import { SidebarContext } from '~/contexts/sidebar-context';
import { useContext } from 'react';
import { FollowUserButton } from '../profile/profile-layout';

const FollowCard = ({ user }: { user: FilteredUser }) => {
  return (
    <section className="mt-4 flex flex-col border-b border-b-gray-300 py-3">
      <div className="flex items-center justify-between">
        <Link href={`/user/${user.id}`} className="flex items-center">
          <Image
            className="rounded-full"
            src={user.imageUrl}
            alt="Profile Image"
            width={50}
            height={50}
          />
          <h4 className="flex justify-center p-4 text-lg font-bold">
            {user?.displayName ?? user.firstName}
          </h4>
        </Link>
        <FollowUserButton useIcons={true} user={user} />
      </div>
    </section>
  );
};

const FeedSidebar = ({
  followingUsers,
  className
}: {
  followingUsers: FilteredUser[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'shrink-0 border-r border-r-gray-300 bg-white px-8 py-4',
        className
      )}
    >
      <h1 className="flex justify-center text-2xl font-bold">Following</h1>
      {followingUsers.map((user) => (
        <FollowCard key={user.id} user={user} />
      ))}
    </div>
  );
};

export default function FeedLayout({
  children,
  authUser,
  followingUsers,
  className
}: {
  children: ReactNode;
  authUser?: FilteredUser;
  followingUsers: FilteredUser[];
  className?: string;
}) {
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  return (
    <>
      <Head>
        <title>It&apos;s not a Diary</title>
        <meta name="description" content="It's a Journal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navbar showMenu={true} />
        <div className="flex flex-1 grow">
          <ReactSlidingPane
            isOpen={isOpen}
            from="left"
            width="350px"
            onRequestClose={() => setIsOpen(false)}
          >
            <FeedSidebar followingUsers={followingUsers} />
          </ReactSlidingPane>
          <FeedSidebar
            className="hidden w-[350px] lg:block"
            followingUsers={followingUsers}
          />
          <div
            className={cn(
              'mt-4 flex w-full max-w-[1000px] flex-col px-10',
              className
            )}
          >
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
