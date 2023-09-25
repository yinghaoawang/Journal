import ContentWrapper from '~/components/content-wrapper';
import { trpc } from '~/utils/trpc';

export default function HomePage() {
  const posts = trpc.posts.getAll.useQuery();
  return (
    <ContentWrapper className="text-2xl">
      {posts.data?.map((post) => {
        return (
          <div key={post.id}>
            <div>By {post.user?.firstName ?? 'Anonymous'}</div>
            <p>{post.content}</p>
          </div>
        );
      })}
    </ContentWrapper>
  );
}
