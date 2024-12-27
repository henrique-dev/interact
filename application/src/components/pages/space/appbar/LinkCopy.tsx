import { GameButton } from '@/components/ui/buttons';
import { ClipboardDocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Input, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export const LinkCopy = () => {
  const [location, setLocation] = useState('');
  const t = useTranslations();

  useEffect(() => {
    setLocation(window.location.href);
  }, []);

  const copyToClipboardHandler = () => {
    navigator.clipboard.writeText(location);
  };

  return (
    <div className="absolute left-0 top-0 z-10 p-8">
      <div className="w-1/2">
        <Popover showArrow offset={20} placement="bottom" className="w-full">
          <PopoverTrigger>
            <GameButton buttonColor="gray">
              <LinkIcon className="h-5 w-5 text-white" />
            </GameButton>
          </PopoverTrigger>
          <PopoverContent className="mx-4">
            <div className="space-y-2 px-1 py-2">
              <div className="text-small font-bold">{t('pages.space.link_copy.you_can_copy')}</div>
              <div className="flex space-x-2">
                <Input className="flex-1" value={location} disabled />
                <GameButton onClick={copyToClipboardHandler} buttonColor="gray">
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </GameButton>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
