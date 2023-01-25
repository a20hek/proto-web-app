import '../styles/globals.css';
import { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Layout from '../components/Layout';
import Wallets from '../components/Wallets';

import { theme } from '../config/theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Wallets>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Wallets>
    </ChakraProvider>
  );
}

export default MyApp;
