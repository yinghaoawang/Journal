import type { AppProps } from 'next/app';

import { api } from '~/utils/api';

import '~/styles/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
