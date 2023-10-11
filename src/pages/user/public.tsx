import Link from 'next/link';
import Layout from '~/components/layouts/layout';
import { Custom404Contents } from '../404';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/trpc/root';
import superjson from 'superjson';
import { db } from '~/server/db';
import { type FilteredUser } from '~/server/trpc/routers/users';

export default function PublicUsersPage({ users }: { users: FilteredUser[] }) {
  return (
    <Layout>
      <Custom404Contents />
      {users?.map((user) => (
        <Link key={user.id} href={`/user/${user.id}`}></Link>
      ))}
    </Layout>
  );
}

export const getServerSideProps = async () => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson
  });

  const users = await helpers.users.getAll.fetch();

  return {
    props: {
      users: JSON.parse(JSON.stringify(users)) as FilteredUser[]
    }
  };
};
