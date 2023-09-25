import type { ChangeEvent } from 'react';
import ContentWrapper from '~/components/content-wrapper';
import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/navigation';

export default function JournalPage() {
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const { mutate } = trpc.posts.create.useMutation({
    onSuccess: () => {
      setTextInput('');
      router.push('/');
    }
  });
  return (
    <ContentWrapper>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">New Journal Post</h2>
        <div className="flex">
          <label>Content: </label>
          <input
            className="grow"
            value={textInput}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setTextInput(event.target.value)
            }
          />
        </div>
        <button
          className="bg-red-600"
          onClick={() => {
            mutate({ content: textInput });
          }}
        >
          Create
        </button>
      </div>
    </ContentWrapper>
  );
}
