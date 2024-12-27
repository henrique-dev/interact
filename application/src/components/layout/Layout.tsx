'use client';

import Image from 'next/image';
import { Footer } from './Footer';
import { LanguageSelect } from './LanguageSelect';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative h-full w-full items-center justify-center">
      <Image
        alt="Background"
        src="/image/background.png"
        className="absolute inset-0 -z-10 size-full object-cover"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
      <div className="absolute top-0 flex w-full justify-center p-4">
        <LanguageSelect />
      </div>
      <div className="absolute bottom-0 flex w-full justify-center">
        <Footer />
      </div>
      {children}
    </div>
  );
};
