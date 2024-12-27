import { GameButton } from '@/components/ui/buttons';
import { ArrowUturnRightIcon } from '@heroicons/react/24/solid';
import { useMeetingOptions } from './use-meeting-options';

export const ExitButton = () => {
  const { disconnectUserHandler } = useMeetingOptions();

  return (
    <GameButton onClick={disconnectUserHandler} buttonColor="orange">
      <ArrowUturnRightIcon className="h-8 w-8" />
    </GameButton>
  );
};
