import React, { type Dispatch, type SetStateAction } from 'react';
import AutoResizingTextArea from './resizing-text-area';
import dayjs from 'dayjs';
import { type Post } from '@prisma/client';

export default function LegacyJournalEditor({
  post,
  textInput,
  setTextInput,
  isLoading
}: {
  post?: Post;
  textInput: string;
  setTextInput: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
}) {
  return (
    <div className="journal mb-3 mt-5">
      <h2 className="font-bold">
        {dayjs(post?.createdAt ?? Date.now()).format('MMMM DD, YYYY')}
      </h2>
      <p>Dear Journal,</p>
      <AutoResizingTextArea
        className="journal-lines w-full resize-none !p-0"
        input={textInput}
        setInput={setTextInput}
        disabled={isLoading}
      />
    </div>
  );
}
