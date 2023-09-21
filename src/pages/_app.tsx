import type { AppProps } from 'next/app';

import { trpc } from '~/utils/trpc';

import '~/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default trpc.withTRPC(MyApp);
