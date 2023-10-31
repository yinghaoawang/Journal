/* eslint-disable react-hooks/exhaustive-deps */
import type { Draft, Post } from '@prisma/client';
import toast from 'react-hot-toast';
import dayjs from '~/utils/dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import { LoadingSpinner } from '../loading';
import cn from 'classnames';
import { MDXEditor } from '../mdx/mdx-editor';
import { ALL_PLUGINS } from '../mdx/_boilerplate';

export const DRAFT_SAVE_INTERVAL = 5000;
const stateData = {
  successUpsertedPost: false
};

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
        if (errorMessage) {
          toast.error(` Failed to save draft: ${errorMessage}`);
        } else {
          toast.error(`Failed to save draft.`);
          console.error(error);
          console.error(errorMessage);
        }
      }
    });

  useEffect(() => {
    const warningMessage =
      'You have unsubmitted changes. Are you sure you want to leave?';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges || stateData.successUpsertedPost) return;
      e.preventDefault();
      e.returnValue = warningMessage;
    };
    const handleRouteChange = () => {
      if (!unsavedChanges || stateData.successUpsertedPost) return;
      const confirmExit = window.confirm(warningMessage);
      if (!confirmExit) {
        router.events.emit('routeChangeError');
      }
    };

    if (type != 'update') return;
    if (unsavedChanges == false) return;

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
    stateData.successUpsertedPost = true;
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

        <div className="mb-4 mt-5">
          <h2 className="mb-4 font-bold">
            {dayjs(post?.createdAt ?? Date.now()).format('MMMM DD, YYYY')}
          </h2>
          <div className="rounded-lg border border-gray-300">
            <MDXEditor
              key={post?.id}
              contentEditableClassName="!min-h-[400px] prose"
              onChange={(markdown) => {
                const scrollToCurrentElement = () => {
                  const caretNode = window?.getSelection()?.focusNode;
                  if (caretNode) {
                    let element = caretNode?.parentElement;

                    if (element == null) return;
                    if (caretNode.nodeType === Node.ELEMENT_NODE) {
                      element = caretNode as HTMLElement;
                    }
                    const offsetY = -50;
                    const y =
                      element.getBoundingClientRect().top +
                      window?.scrollY +
                      offsetY;

                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                };

                setTextInput(markdown);
                scrollToCurrentElement();
              }}
              markdown={textInput}
              autoFocus={true}
              readOnly={isLoading}
              plugins={ALL_PLUGINS}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button
          className="flex w-36 items-center justify-center rounded-lg bg-black-pearl-600 p-2 text-white sm:w-40 sm:py-4"
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
          {!isLoading && (type === 'create' ? 'Create Post' : 'Update Post')}
        </button>
        {type === 'create' && (
          <div className="flex flex-col items-end gap-0 sm:flex-row sm:items-start sm:justify-start sm:gap-2">
            {isUpsertingDraft && (
              <span className="text-gray-600">Saving...</span>
            )}
            {!isUpsertingDraft && (
              <>
                <span className="ml-3 text-gray-600 sm:ml-0">
                  Draft last saved
                </span>
                <span className="font-light text-gray-600 sm:mr-2">
                  {dayjs(draftLastSaved).format('h:mm:ssA')}
                </span>
              </>
            )}
            <button
              className={cn(
                'hidden sm:block',
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
