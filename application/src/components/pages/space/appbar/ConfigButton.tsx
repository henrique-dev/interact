import { GameButton } from '@/components/ui/buttons';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { ModalConfigureMedia } from './ModalConfigureMedia';

export const ConfigButton = () => {
  const [isModalConfigureMediaOpen, setIsModalConfigureMediaOpen] = useState(false);

  return (
    <>
      <GameButton buttonColor="gray" onClick={setIsModalConfigureMediaOpen.bind(null, true)}>
        <Cog6ToothIcon className="h-8 w-8" />
      </GameButton>
      <ModalConfigureMedia isOpen={isModalConfigureMediaOpen} setIsOpen={setIsModalConfigureMediaOpen} />
    </>
  );
};
