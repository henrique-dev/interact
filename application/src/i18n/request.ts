import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['pt-BR', 'en'];

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  let locale = 'en';

  try {
    const cookiesStore = await cookies();
    const localeCookie = cookiesStore.get('NEXT_LOCALE');

    if (localeCookie && locales.includes(localeCookie.value)) {
      locale = localeCookie.value;
    }
  } catch {}

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
