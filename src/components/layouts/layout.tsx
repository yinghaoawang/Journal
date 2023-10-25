import Head from 'next/head';
import type { ReactNode } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import ContentWrapper from './content-wrapper';

export default function Layout({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <Head>
        <title>It&apos;s not a Diary</title>
        <meta name="description" content="It's a Journal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 grow justify-center">
          <ContentWrapper className={className}>{children}</ContentWrapper>
        </div>
        <Footer />
      </div>
    </>
  );
}
