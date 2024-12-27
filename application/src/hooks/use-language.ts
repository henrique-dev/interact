import { setLocale } from '@/actions/set-locale';
import { useRouter } from 'next/navigation';
import { Key } from 'react';

export const useLanguage = () => {
  const router = useRouter();

  const onChangeLanguageHandler = async (locale: Key) => {
    await setLocale(locale.toString());
    router.refresh();
  };

  return {
    onChangeLanguageHandler,
  };
};
