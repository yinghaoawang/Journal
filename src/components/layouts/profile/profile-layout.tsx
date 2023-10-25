import Head from 'next/head';
import type { ReactNode } from 'react';
import Navbar from '~/components/layouts/navbar';
import Footer from '~/components/layouts/footer';
import { type FilteredUser } from '~/server/trpc/routers/users';
import cn from 'classnames';
import ReactSlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import { SidebarContext } from '~/contexts/sidebar-context';
import { useContext } from 'react';
import ProfileSidebar from './profile-sidebar';

export default function ProfileLayout({
  children,
  user,
  className
}: {
  children: ReactNode;
  user: FilteredUser;
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
        <div className="flex flex-1 grow justify-center">
          <ReactSlidingPane
            isOpen={isOpen}
            from="left"
            width="300px"
            onRequestClose={() => setIsOpen(false)}
          >
            <ProfileSidebar user={user} />
          </ReactSlidingPane>
          <ProfileSidebar
            className="hidden w-[300px] border-r border-r-gray-300 lg:block"
            user={user}
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
