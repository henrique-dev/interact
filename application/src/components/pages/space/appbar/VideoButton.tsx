import { GameButton } from '@/components/ui/buttons';
import { VideoCameraIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import { SpaceContext } from '../SpaceProvider';
import { useVideoOptions } from './use-video-options';

export const VideoButton = () => {
  const { userProperties } = useContext(SpaceContext);
  const { enableVideoHandler } = useVideoOptions();

  return (
    <GameButton onClick={enableVideoHandler.bind(null, !userProperties.video)} buttonColor={userProperties.video ? 'green' : 'red'}>
      <VideoCameraIcon className="h-8 w-8" />
    </GameButton>
  );
};
