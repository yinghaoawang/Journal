import type { AppProps } from 'next/app';

import { trpc } from '~/utils/trpc';

import '~/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Layout from '~/components/layout';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ClerkProvider>
  );
};

export default trpc.withTRPC(MyApp);
