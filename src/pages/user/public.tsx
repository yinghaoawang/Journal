import Link from 'next/link';
import Layout from '~/components/layouts/layout';
import { Custom404Contents } from '../404';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import superjson from 'superjson';
import { db } from '~/server/db';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';

export default function PublicUsersPage({}) {
  const { data: users, isLoading } = trpc.users.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  console.log(users);
  return (
    <Layout>
      <Custom404Contents />
      users go here
      {users?.map((user) => (
        <Link key={user.id} href={`/user/${user.id}`}></Link>
      ))}
    </Layout>
  );
}

export const getStaticProps = async () => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  await helpers.users.getAll.prefetch();

  return {
    props: {
      trpcState: JSON.stringify(helpers.dehydrate())
    }
  };
};
