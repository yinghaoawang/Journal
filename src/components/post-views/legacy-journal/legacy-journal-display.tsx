import { type Post } from '@prisma/client';
import dayjs from 'dayjs';

export default function LegacyJournalDisplay({ post }: { post: Post }) {
  return (
    <div className="journal mt-4">
      <h2>{dayjs(post.createdAt).format('MMMM DD, YYYY')}</h2>
      <p>Dear Journal,</p>
      <p>{post.content}</p>
    </div>
  );
}
