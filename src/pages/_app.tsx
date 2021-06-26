import 'tailwindcss/tailwind.css';
import 'styles/tailwindcss.css';
import { Provider } from 'next-auth/client';
import { AppProps } from 'next/dist/next-server/lib/router/router';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
