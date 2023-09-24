'use client';
import { trpc } from '~/utils/trpc';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import Layout from '~/components/layout';

export default function HomePage() {
  const posts = trpc.posts.getAll.useQuery();
  const { user, isSignedIn } = useUser();
  return (
    <Layout>
      {!isSignedIn && <SignInButton />}
      {isSignedIn && (
        <>
          <div>Hi {user?.firstName}!</div>
          <SignOutButton />
        </>
      )}
      <div className="text-2xl text-zinc-800">
        {posts.data?.map((post) => {
          return (
            <div key={post.id}>
              <div>By {post.user?.firstName ?? 'Anonymous'}</div>
              <p>{post.content}</p>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
