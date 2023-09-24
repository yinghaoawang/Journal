import { trpc } from '~/utils/trpc';
import Layout from '~/components/layout';

export default function HomePage() {
  const posts = trpc.posts.getAll.useQuery();
  return (
    <Layout>
      <div className="text-2xl">
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
