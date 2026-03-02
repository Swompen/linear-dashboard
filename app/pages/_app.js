import '../styles/globals.css';
import '../i18n';
import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <I18nextProvider i18n={i18n}>
        <Component {...pageProps} />
      </I18nextProvider>
    </SessionProvider>
  );
}