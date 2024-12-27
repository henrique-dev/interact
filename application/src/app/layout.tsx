import { DefaultProvider } from '@/providers/DefaultProvider';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTimeZone } from 'next-intl/server';
import localFont from 'next/font/local';
import { twJoin } from 'tailwind-merge';
import { CustomDocument } from './CustomDocument';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'AniMeeting',
  description: 'AniMeeting',
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale();
  const timezone = await getTimeZone();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <CustomDocument locale={locale}>
      <body className={twJoin(geistSans.variable, geistMono.variable, 'h-full antialiased')}>
        <NextIntlClientProvider timeZone={timezone} locale={locale} messages={messages}>
          <DefaultProvider>{children}</DefaultProvider>
        </NextIntlClientProvider>
      </body>
    </CustomDocument>
  );
};

export default RootLayout;
