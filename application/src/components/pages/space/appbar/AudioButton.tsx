import { GameButton } from '@/components/ui/buttons';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import { SpaceContext } from '../SpaceProvider';
import { useAudioOptions } from './use-audio-options';

export const AudioButton = () => {
  const { userProperties } = useContext(SpaceContext);
  const { enableAudioHandler } = useAudioOptions();

  return (
    <GameButton onClick={enableAudioHandler.bind(null, !userProperties.audio)} buttonColor={userProperties.audio ? 'green' : 'red'}>
      <MicrophoneIcon className="h-8 w-8" />
    </GameButton>
  );
};
