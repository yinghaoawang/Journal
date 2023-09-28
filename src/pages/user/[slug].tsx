import type { GetStaticProps, NextPage } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { trpc } from '~/utils/trpc';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import Custom404Page from '../404';
import ContentWrapper from '~/components/content-wrapper';
import { LoadingPage } from '~/components/loading';
import JournalView from '~/components/journal-view';
import Image from 'next/image';
import { type User } from '@clerk/nextjs/dist/types/server';
import cn from 'classnames';
import { useUser } from '@clerk/nextjs';

const UserDetails = ({ user }: { user: User }) => {
  const { user: authUser } = useUser();
  const isCurrentUser = authUser?.id == user.id;
  const itemClass = 'w-20 flex flex-col';
  const UserStats = () => {
    return (
      <div className="flex flex-col gap-3">
        <div className="mr-3 mt-3 flex grow items-center justify-end gap-4 text-center font-semibold">
          <div className={cn(itemClass)}>
            <span>0</span>Posts
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
              'w-full rounded-md bg-green-500 px-5 py-2 font-semibold text-gray-200',
              isCurrentUser && 'bg-gray-300 text-gray-400'
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
      <div className="flex justify-between gap-10">
        <div>
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

const UserPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: user, isLoading } = trpc.users.getById.useQuery({ userId: id });

  if (user == null) {
    if (isLoading) {
      return <LoadingPage />;
    } else {
      return <Custom404Page />;
    }
  }

  return (
    <ContentWrapper>
      <section className="mb-12 border-b border-b-gray-300 pb-12">
        <h1 className="mb-4 text-2xl font-bold">
          {user.username ?? user.firstName}&apos;s Profile
        </h1>
        <UserDetails user={user} />
      </section>
      <JournalView user={user} />
    </ContentWrapper>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const slug = context.params?.slug;
  if (typeof slug !== 'string') throw new Error('No slug');

  await helpers.users.getById.prefetch({ userId: slug });

  return {
    props: {
      trpcState: JSON.stringify(helpers.dehydrate()),
      id: slug
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
