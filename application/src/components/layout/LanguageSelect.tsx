import { useLanguage } from '@/hooks/use-language';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

const languageOptions = [
  { id: 'pt-BR', description: 'PT', name: 'BR', flag: 'BR' },
  { id: 'en', description: 'EN', name: 'US', flag: 'UK' },
];

export const LanguageSelect = () => {
  const locale = useLocale();
  const { onChangeLanguageHandler } = useLanguage();
  const t = useTranslations();

  const currentOption = languageOptions.find((language) => language.id === locale);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" className="h-8 w-8" isIconOnly>
          <Image src={`/image/flags/${currentOption?.flag}.svg`} alt="Country flag" fill style={{ objectFit: 'fill' }} priority />
        </Button>
      </DropdownTrigger>
      <DropdownMenu onAction={(key) => onChangeLanguageHandler(key)}>
        {languageOptions.map((languageOption) => (
          <DropdownItem
            key={languageOption.id}
            className="flex flex-row"
            startContent={
              <>
                <div className="relative h-5 w-5">
                  <Image src={`/image/flags/${languageOption.flag}.svg`} alt="Country flag" fill style={{ objectFit: 'fill' }} priority />
                </div>
              </>
            }
          >
            {t(`languages.${languageOption.id}`)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
