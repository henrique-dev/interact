'use client';

import { GameButton } from '@/components/ui/buttons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export const HomePage = () => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex h-full w-full overflow-hidden 2xl:overflow-auto">
      <div className="mx-0 flex w-full flex-1 items-center 2xl:container 2xl:mx-auto 2xl:w-auto">
        <div className="flex-1 space-y-8 px-10 sm:min-w-[36rem]">
          <h1 className="text-center text-4xl sm:text-left md:text-8xl">AniMeet</h1>
          <h2 className="text-center text-3xl sm:text-left sm:text-7xl">{t('pages.home.home_page.title')}</h2>
          <p className="text-center text-lg sm:text-left">{t('pages.home.home_page.description')}</p>
          <div className="flex justify-center sm:justify-start">
            <GameButton onClick={router.push.bind(null, '/spaces/new', {})} buttonColor="blue">
              {t('pages.home.home_page.new_space')}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};
