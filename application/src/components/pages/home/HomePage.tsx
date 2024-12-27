'use client';

import { GameButton } from '@/components/ui/buttons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export const HomePage = () => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="relative h-full w-full">
      <div className="flex h-full w-full lg:w-1/2">
        <div className="relative flex h-full w-full items-center bg-zinc-900/90 lg:bg-transparent">
          <div className="absolute left-0 -z-10 hidden h-full w-full pr-40 lg:block">
            <div className="h-full w-full bg-zinc-900/90"></div>
          </div>
          <div className="space-y-8 px-10">
            <h1 className="text-center text-4xl sm:text-left md:text-8xl">Interact</h1>
            <h2 className="text-center text-xl sm:text-left sm:text-4xl">{t('pages.home.home_page.title')}</h2>
            <p className="text-center text-lg sm:text-left">{t('pages.home.home_page.description')}</p>
            <div className="flex justify-center sm:justify-start">
              <GameButton onClick={router.push.bind(null, '/spaces/new', {})} buttonColor="blue">
                {t('pages.home.home_page.new_space')}
              </GameButton>
            </div>
          </div>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute -right-40 -z-10 hidden h-full w-80 transform fill-zinc-900/90 lg:block"
          >
            <polygon points="0,0 90,0 50,100 0,100" />
          </svg>
        </div>
      </div>
    </div>
  );
};
