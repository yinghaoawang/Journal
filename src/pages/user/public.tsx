import Link from 'next/link';
import Layout from '~/components/layouts/layout';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import { Custom404Contents } from '../404';

export default function PublicUsersPage() {
  const { data: users, isLoading } = trpc.users.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  return (
    <Layout>
      <Custom404Contents />
      {users?.map((user) => (
        <Link key={user.id} href={`/user/${user.id}`}></Link>
      ))}
    </Layout>
  );
}
