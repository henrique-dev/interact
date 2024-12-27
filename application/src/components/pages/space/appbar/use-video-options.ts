import { useContext } from 'react';
import { ConnectionContext } from '../ConnectionProvider';
import { MediaContext } from '../MediaProvider';
import { SpaceContext } from '../SpaceProvider';

export const useVideoOptions = () => {
  const { userProperties, setUserProperties } = useContext(SpaceContext);
  const { updateLocalStream } = useContext(ConnectionContext);
  const { localStreamRef } = useContext(MediaContext);

  const enableVideoHandler = (enabled: boolean) => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        track.enabled = enabled;
      }
    });

    setUserProperties('video', enabled);
  };

  const changeVideoDeviceHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;

    if (!deviceId) return;

    updateLocalStream({
      audio: { deviceId: { exact: userProperties.audioDevice } },
      video: { deviceId: { exact: deviceId } },
    })
      .then(() => {
        setUserProperties('videoDevice', deviceId);
      })
      .catch((err) => {
        console.warn('cannot change the media');
        console.warn(err);
      });
  };

  return {
    enableVideoHandler,
    changeVideoDeviceHandler,
  };
};
