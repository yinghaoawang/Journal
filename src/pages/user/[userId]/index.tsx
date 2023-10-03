import type { GetStaticProps } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import { LoadingPage, LoadingSpinner } from '~/components/loading';
import Image from 'next/image';
import { type User } from '@clerk/nextjs/dist/types/server';
import cn from 'classnames';
import { useUser } from '@clerk/nextjs';
import Layout from '~/components/layouts/layout';
import Custom404Page from '~/pages/404';
import Link from 'next/link';
import PostCarouselView from '~/components/post-views/post-carousel-view';

const UserDetails = ({ user }: { user: User }) => {
  const { user: authUser } = useUser();

  const { data: postCount, isLoading: isPostCountLoading } =
    trpc.posts.getCountByUserId.useQuery({
      userId: user.id
    });

  const isCurrentUser = authUser?.id == user.id;
  const itemClass = 'w-20 flex flex-col';
  const UserStats = () => {
    return (
      <div className="flex flex-col gap-3">
        <div className="mr-3 mt-3 flex grow items-center justify-center gap-4 text-center font-semibold sm:grow-0 sm:justify-end">
          <div className={cn(itemClass)}>
            <span>
              {isPostCountLoading ? <LoadingSpinner size={16} /> : postCount}
            </span>
            Posts
          </div>
          <div className={cn(itemClass)}>
            <span>0</span>Followers
          </div>
          <div className={cn(itemClass)}>
            <span>0</span>Following
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (authUser == null) {
                alert('You must be signed in to follow.');
              } else {
                alert("Not yet implemented! It's coming soon, I swear.");
              }
            }}
            disabled={isCurrentUser}
            className={cn(
              'w-full rounded-md px-5 py-2 font-semibold ',
              isCurrentUser
                ? 'bg-gray-300 text-gray-400'
                : 'bg-green-500 text-gray-200'
            )}
          >
            Follow
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col justify-between gap-0 sm:flex-row sm:gap-10">
        <div className="flex justify-center sm:justify-start">
          <Image
            className="rounded-full"
            src={user.imageUrl}
            alt="Profile Image"
            width={120}
            height={120}
          />
        </div>
        <UserStats />
      </div>
      <div>
        <p>
          {(user.publicMetadata?.description as string | undefined) ??
            'This user is awfully quiet.'}
        </p>
      </div>
    </div>
  );
};

const UserPage = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({ userId });

  if (user == null) {
    if (isLoading) {
      return <LoadingPage />;
    } else {
      return <Custom404Page />;
    }
  }

  return (
    <Layout>
      <section className="border-b border-b-gray-300 pb-12">
        <h1 className="mb-4 flex justify-center text-2xl font-bold sm:justify-start">
          {user.username ?? user.firstName}&apos;s Profile
        </h1>
        <UserDetails user={user} />
      </section>
      <section className="flex gap-4 border-b border-b-gray-300 py-3">
        <Link href={`/user/${user.id}/journal/all`} className="text-blue-500">
          all posts view
        </Link>
        <Link href={`/user/${user.id}/journal/`} className="text-blue-500">
          single post view
        </Link>
      </section>
      <PostCarouselView className="mt-12" user={user} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const userId = context.params?.userId;
  if (typeof userId !== 'string') throw new Error('No userId in search params');

  await helpers.users.getById.prefetch({ userId });

  return {
    props: {
      trpcState: JSON.stringify(helpers.dehydrate()),
      userId
    }
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export default UserPage;
