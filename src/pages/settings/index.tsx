import { useUser } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/dist/types/server';
import Layout from '~/components/layouts/layout';
import { LoadingPage } from '~/components/loading';
import Custom404Page from '../404';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { trpc } from '~/utils/trpc';
import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

const SettingsForm = ({ user }: { user: User }) => {
  const { emailAddresses, firstName, lastName, createdAt, publicMetadata } =
    user;

  const [displayName, setDisplayName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  useEffect(() => {
    setDisplayName((publicMetadata.displayName as string) ?? '');
    setIsPublic((publicMetadata.isPublic as boolean) ?? false);
  }, [user]);

  const { mutate: updateSettings, isLoading: isUpdatingSettings } =
    trpc.profile.updateSettings.useMutation({
      onSuccess: () => {
        toast.success(`Settings updated successfully!`);
      },
      onError: (error) => {
        if (error?.data?.zodError) {
          const errors = error.data?.zodError?.fieldErrors;
          const errorMessage = errors?.[Object.keys(errors)?.[0] ?? '']?.[0];
          if (errorMessage) {
            toast.error(errorMessage);
          } else {
            toast.error('Failed to update settings.');
          }
        } else {
          toast.error('Failed to update settings.');
        }
      }
    });

  if (user == null) return;

  const formItemClass = 'form-item flex justify-between';
  return (
    <div className="flex flex-col gap-5">
      <div className={cn(formItemClass)}>
        <label>Email{emailAddresses.length > 1 && 's'}</label>
        {emailAddresses.map((email) => (
          <div key={email.emailAddress}>{email.emailAddress}</div>
        ))}
      </div>
      <div className={cn(formItemClass)}>
        <label>Display Name</label>
        <input
          onChange={(event) => setDisplayName(event.target.value)}
          value={displayName ?? ''}
        />
      </div>
      <div className={cn(formItemClass)}>
        <label>First Name</label>
        <div>{firstName ?? ''}</div>
      </div>
      <div className={cn(formItemClass)}>
        <label>Last Name</label>
        <div>{lastName ?? ''}</div>
      </div>
      <div className={cn(formItemClass)}>
        <label>Account Created</label>
        <div>{dayjs(createdAt).format('MM/DD/YYYY')}</div>
      </div>
      <div className={cn(formItemClass)}>
        <label>Private Account</label>
        <input
          className="h-[17px] w-[17px]"
          type="checkbox"
          onChange={(event) => {
            setIsPublic(!event.target.checked);
          }}
          checked={!isPublic}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => {
            updateSettings({ displayName, isPublic });
          }}
          className="button"
          disabled={isUpdatingSettings}
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const { user: authUser, isLoaded: isAuthUserLoaded } = useUser();
  if (!isAuthUserLoaded) return <LoadingPage />;
  if (authUser == null) return <Custom404Page />;
  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold">Settings</h2>
      {isAuthUserLoaded && <SettingsForm user={authUser as unknown as User} />}
    </Layout>
  );
}
