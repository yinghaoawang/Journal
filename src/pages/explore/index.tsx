import Link from 'next/link';
import Layout from '~/components/layouts/layout';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';

export default function ExplorePage() {
  const { data, isLoading } = trpc.users.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  return (
    <Layout>
      <h2 className="text-2xl font-bold">Public Users</h2>
      {data?.map((user) => (
        <Link key={user.id} href={`/user/${user.id}`}>
          {user.displayName ?? user.firstName}
        </Link>
      ))}
    </Layout>
  );
}
