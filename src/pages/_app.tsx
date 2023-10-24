import type { AppProps } from 'next/app';

import { trpc } from '~/utils/trpc';

import '~/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '~/contexts/providers';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Providers>
      <Toaster />
      <Component {...pageProps} />
    </Providers>
  );
};

export default trpc.withTRPC(MyApp);
