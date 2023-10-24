import ProfileLayout from '~/components/layouts/profile/profile-layout';
import AllPostsView from '~/components/post-views/all-posts-view';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import { type GetServerSideProps } from 'next';
import { type Post } from '@prisma/client';
import { type FilteredUser } from '~/server/trpc/routers/users';
import { getAuth } from '@clerk/nextjs/server';

export default function UserJournalAllPage({
  user,
  posts,
  isProfileHidden
}: {
  user: FilteredUser;
  posts: Post[];
  isProfileHidden: boolean;
}) {
  return (
    <ProfileLayout user={user}>
      <AllPostsView
        posts={posts}
        user={user}
        isProfileHidden={isProfileHidden}
      />
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params
}) => {
  const { userId: authUserId } = getAuth(req);
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: authUserId },
    transformer: superjson
  });

  const userId = params?.userId;
  if (typeof userId !== 'string') throw new Error('No userId in search params');

  const isProfileHidden = await helpers.profile.isUserHiddenToAuth.fetch({
    userId
  });
  const user = await helpers.users.getById.fetch({ userId });
  const posts = !isProfileHidden
    ? await helpers.posts.getByUserId.fetch({
        userId,
        orderBy: 'desc'
      })
    : [];

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)) as FilteredUser,
      posts: JSON.parse(JSON.stringify(posts)) as Post[],
      isProfileHidden
    }
  };
};
