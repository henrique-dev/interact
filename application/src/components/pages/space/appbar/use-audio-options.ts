import { useContext } from 'react';
import { ConnectionContext } from '../ConnectionProvider';
import { MediaContext } from '../MediaProvider';
import { SpaceContext } from '../SpaceProvider';

export const useAudioOptions = () => {
  const { userProperties, setUserProperties } = useContext(SpaceContext);
  const { updateLocalStream } = useContext(ConnectionContext);
  const { localStreamRef } = useContext(MediaContext);

  const enableAudioHandler = (enabled: boolean) => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'audio') {
        track.enabled = enabled;
      }
    });

    setUserProperties('audio', enabled);
  };

  const changeAudioDeviceHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;

    if (!deviceId) return;

    updateLocalStream({
      audio: { deviceId: { exact: deviceId } },
      video: { deviceId: { exact: userProperties.videoDevice } },
    })
      .then(() => {
        setUserProperties('audioDevice', deviceId);
      })
      .catch((err) => {
        console.warn('cannot change the media');
        console.warn(err);
      });
  };

  return {
    enableAudioHandler,
    changeAudioDeviceHandler,
  };
};
