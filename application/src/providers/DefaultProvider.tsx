'use client';

import { NextUIProvider } from '@nextui-org/react';

export const DefaultProvider = ({ children }: { children: React.ReactNode }) => {
  return <NextUIProvider className='h-full'>{children}</NextUIProvider>;
};
