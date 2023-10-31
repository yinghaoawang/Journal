import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import { db } from '~/server/db';
import superjson from 'superjson';
import ProfileLayout from '~/components/layouts/profile/profile-layout';
import Custom404Page from '~/pages/404';
import PostCarouselView from '~/components/post-views/post-carousel-view';
import { type GetServerSideProps } from 'next';
import { type FilteredUser } from '~/server/trpc/routers/users';
import { getAuth } from '@clerk/nextjs/server';

const UserPage = ({ user }: { user: FilteredUser }) => {
  if (user == null) return <Custom404Page />;

  return (
    <ProfileLayout user={user}>
      <PostCarouselView className="mt-12" user={user} />
    </ProfileLayout>
  );
};

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

  let user;
  if (authUserId != null) {
    user = await helpers.users.getDetailedUserById.fetch({ userId });
  }

  if (user == null) {
    user = await helpers.users.getHiddenUserById.fetch({ userId });
  }

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)) as FilteredUser
    }
  };
};

export default UserPage;
