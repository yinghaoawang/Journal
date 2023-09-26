import ContentWrapper from '~/components/content-wrapper';
import { trpc } from '~/utils/trpc';
import Image from 'next/image';
import { LoadingPage } from '~/components/loading';
import dayjs from '~/utils/dayjs';

export default function HomePage() {
  const posts = trpc.posts.getAll.useQuery();

  if (posts.isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentWrapper className="text-2xl">
      {posts.data?.map((post) => {
        return (
          <div className="flex gap-3" key={post.id}>
            <div className="pt-1">
              <Image
                className="rounded-full"
                width={40}
                height={40}
                src={post.user?.imageUrl ?? '/default-avatar.png'}
                alt="Profile picture"
              />
            </div>
            <div>
              <div>
                By {post.user?.firstName ?? 'Anonymous'}{' '}
                <span className="font-light text-gray-600">
                  {dayjs(post.createdAt).fromNow()}
                </span>
              </div>
              <p>{post.content}</p>
            </div>
          </div>
        );
      })}
    </ContentWrapper>
  );
}
