import type { ChangeEvent, KeyboardEvent } from 'react';
import ContentWrapper from '~/components/content-wrapper';
import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dayjs from '~/utils/dayjs';

export default function JournalPage() {
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const { mutate } = trpc.posts.create.useMutation({
    onSuccess: () => {
      setTextInput('');
      router.push('/journal');
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content?.[0];
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to create entry!');
      }
    }
  });
  return (
    <ContentWrapper>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">New Journal Post</h2>
        <div className="journal-lines my-5 whitespace-pre-wrap">
          <p className="font-light text-gray-600">
            {dayjs(Date.now()).format('MMMM DD, YYYY')}
          </p>
          <p>Dear Journal,</p>
          <textarea
            rows={10}
            className="journal-lines w-full !p-0"
            value={textInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setTextInput(event.target.value)
            }
          />
        </div>
      </div>
      <button
        className="w-40 rounded-lg bg-black-pearl-600 p-4 text-white"
        onClick={() => {
          mutate({ content: textInput });
        }}
      >
        Create Entry
      </button>
    </ContentWrapper>
  );
}
