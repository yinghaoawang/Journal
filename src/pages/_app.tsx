import type { AppProps } from 'next/app';

import { trpc } from '~/utils/trpc';

import '~/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Layout from '~/components/layout';
import { Toaster } from 'react-hot-toast';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider>
      <Toaster />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ClerkProvider>
  );
};

export default trpc.withTRPC(MyApp);
