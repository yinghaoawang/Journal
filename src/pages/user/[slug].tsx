import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

export default function UserPage() {
  const router = useRouter();
  const userId = router.query.slug?.[0];
  if (userId == null) {
    throw new Error('wat');
  }

  const user = trpc.users.get.useQuery({ userId });

  return <p>User: {user?.data?.firstName}</p>;
}
