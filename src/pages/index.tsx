import Head from 'next/head';
import { trpc } from '~/utils/trpc';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';

export default function Home() {
  const posts = trpc.posts.getAll.useQuery();
  const user = useUser();
  return (
    <>
      <Head>
        <title>It&apos;s not a Diary</title>
        <meta name="description" content="It's a Journal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-zinc-600">
        {!user.isSignedIn && <SignInButton />}
        {user.isSignedIn && <SignOutButton />}
        <div className="text-2xl text-white">
          {posts.data?.map((post) => {
            return <div key={post.id}>{post.content}</div>;
          })}
        </div>
      </div>
    </>
  );
}
