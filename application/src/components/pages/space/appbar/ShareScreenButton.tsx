import { GameButton } from '@/components/ui/buttons';
import { ComputerDesktopIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import { MediaContext } from '../MediaProvider';
import { SpaceContext } from '../SpaceProvider';
import { useShareScreen } from './use-share-screen';

export const ShareScreenButton = () => {
  const { userProperties } = useContext(SpaceContext);
  const { disableShareScreen } = useContext(MediaContext);
  const { toggleShareScreen } = useShareScreen();

  if (disableShareScreen) return undefined;

  return (
    <GameButton onClick={toggleShareScreen} buttonColor={userProperties.shareScreen ? 'green' : 'blue'}>
      <ComputerDesktopIcon className="h-8 w-8" />
    </GameButton>
  );
};
