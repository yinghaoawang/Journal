'use client';
import Head from 'next/head';
import { trpc } from '~/utils/trpc';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';

export default function Home() {
  const posts = trpc.posts.getAll.useQuery();
  const { user, isSignedIn } = useUser();
  console.log(posts);
  return (
    <>
      <Head>
        <title>It&apos;s not a Diary</title>
        <meta name="description" content="It's a Journal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-zinc-600">
        {!isSignedIn && <SignInButton />}
        {isSignedIn && (
          <>
            <div>Hi {user?.firstName}!</div>
            <SignOutButton />
          </>
        )}
        <div className="text-2xl text-white">
          {posts.data?.map((post) => {
            return (
              <div key={post.id}>
                <div>By {post.user?.firstName ?? 'Anonymous'}</div>
                <p>{post.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
