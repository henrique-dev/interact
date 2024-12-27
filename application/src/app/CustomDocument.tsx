'use client';

import { twJoin } from 'tailwind-merge';

type CustomDocumentProps = {
  children: React.ReactNode;
  locale: string;
};

export const CustomDocument = ({ locale, children }: CustomDocumentProps) => {
  return (
    <html lang={locale} className={twJoin('dark h-full')}>
      {children}
    </html>
  );
};
