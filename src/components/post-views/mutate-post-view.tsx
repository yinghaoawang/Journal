/* eslint-disable react-hooks/exhaustive-deps */
import type { Draft, Post } from '@prisma/client';
import toast from 'react-hot-toast';
import AutoResizingTextArea from '~/components/resizing-text-area';
import dayjs from '~/utils/dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import { LoadingSpinner } from '../loading';
import cn from 'classnames';

export const DRAFT_SAVE_INTERVAL = 5000;

const MutatePostView = ({
  type,
  post,
  userDraft
}: {
  type: 'create' | 'update';
  post?: Post;
  userDraft?: Draft | null;
}) => {
  const router = useRouter();
  const utils = trpc.useContext();
  let defaultTextInput = post?.content ?? '';
  if (type === 'create') defaultTextInput = userDraft?.content ?? '';
  const [textInput, setTextInput] = useState(defaultTextInput);
  const [prevUserDraft, setPrevUserDraft] = useState('');
  const [draftLastSaved, setDraftLastSaved] = useState(Date.now());
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { mutate: upsertDraft, isLoading: isUpsertingDraft } =
    trpc.profile.upsertDraft.useMutation({
      onSuccess: () => {
        console.log('Draft saved');
        setPrevUserDraft(textInput);
        setDraftLastSaved(Date.now());
      },
      onError: (error) => {
        const errors = error.data?.zodError?.fieldErrors;
        const errorMessage = errors?.[Object.keys(errors)?.[0] ?? '']?.[0];
        toast.error(`Failed to save draft.`);
        console.error(error);
        console.error(errorMessage);
      }
    });

  useEffect(() => {
    if (type != 'update') return;
    if (unsavedChanges == false) return;
    console.log('creating event listener');
    const warningMessage =
      'You have unsubmitted changes. Are you sure you want to leave?';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      e.returnValue = warningMessage;
    };
    const handleRouteChange = () => {
      if (unsavedChanges) {
        const confirmExit = window.confirm(warningMessage);
        if (!confirmExit) {
          router.events.emit('routeChangeError');
        }
      }
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [unsavedChanges]);

  useEffect(() => {
    if (unsavedChanges) return;
    if (textInput != defaultTextInput) setUnsavedChanges(true);
  }, [textInput]);

  useEffect(() => {
    if (type == 'update') return;
    if (
      isUpsertingDraft ||
      prevUserDraft == textInput ||
      Date.now() < draftLastSaved + DRAFT_SAVE_INTERVAL
    )
      return;
    upsertDraft({ content: textInput });
  }, [textInput]);

  const onUpsertSuccess = () => {
    setTextInput('');
    toast.success(
      `Post ${type === 'create' ? 'created' : 'edited'} successfully!`
    );
    void router.push('/journal');
    void utils.posts.invalidate();
  };
  const onUpsertError = (errorMessage?: string) => {
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      toast.error(`Failed to ${type} post!`);
    }
  };
  const { mutate: createPost, isLoading: isCreating } =
    trpc.posts.create.useMutation({
      onSuccess: onUpsertSuccess,
      onError: (error) => {
        const errors = error.data?.zodError?.fieldErrors;
        const errorMessage = errors?.[Object.keys(errors)?.[0] ?? '']?.[0];
        onUpsertError(errorMessage);
      }
    });

  const { mutate: updatePost, isLoading: isUpdating } =
    trpc.posts.update.useMutation({
      onSuccess: onUpsertSuccess,
      onError: (error) => {
        const errors = error.data?.zodError?.fieldErrors;
        const errorMessage = errors?.[Object.keys(errors)?.[0] ?? '']?.[0];
        onUpsertError(errorMessage);
      }
    });
  const isLoading = isCreating || isUpdating;
  return (
    <>
      <div className="flex flex-col">
        <div className="flex">
          <h2 className="text-lg font-bold">
            {type === 'create' ? 'Creating' : 'Editing'} Journal Post
          </h2>
        </div>

        <div className="journal mb-3 mt-5">
          <h2>
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
      </div>
      <div className="flex justify-between">
        <button
          className="flex w-40 items-center justify-center rounded-lg bg-black-pearl-600 p-4 text-white"
          onClick={() => {
            if (type === 'create') {
              createPost({ content: textInput });
            } else {
              if (post == null)
                throw new Error('Post prop required for update type');

              updatePost({ id: post.id, content: textInput });
            }
          }}
          disabled={isLoading}
        >
          {isLoading && <LoadingSpinner size={20} />}
          {!isLoading &&
            (type === 'create' ? 'Create New Post' : 'Update Post')}
        </button>
        {type === 'create' && (
          <div className="flex items-start gap-4">
            {isUpsertingDraft && (
              <span className="text-gray-600">Saving...</span>
            )}
            {!isUpsertingDraft && (
              <span className="text-gray-600">
                <span className="mr-1">Draft last saved</span>
                <span className="font-light">
                  {dayjs(draftLastSaved).format('h:mm:ssA')}
                </span>
              </span>
            )}
            <button
              className={cn(
                isUpsertingDraft ? 'text-gray-400' : 'text-blue-500'
              )}
              disabled={isUpsertingDraft}
              onClick={() => upsertDraft({ content: textInput })}
            >
              save
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MutatePostView;
