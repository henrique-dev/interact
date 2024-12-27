import { useTranslations } from 'next-intl';
import { GithubLink, LinkedinLink } from '../ui/links';

export const Footer = () => {
  const t = useTranslations('layout.footer');

  return (
    <footer className="absolute bottom-0 space-y-4 py-4">
      <div className="flex justify-center px-6 lg:px-8">
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-base leading-5 text-white">&copy; {t('all_rights_reserved')}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-x-6">
        <GithubLink />
        <LinkedinLink />
      </div>
    </footer>
  );
};
