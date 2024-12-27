import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useCallback, useContext } from 'react';
import { ConnectionContext } from '../ConnectionProvider';
import { MediaContext } from '../MediaProvider';
import { SpaceContext } from '../SpaceProvider';

export const useShareScreen = () => {
  const { userId } = useContext(SocketIoContext);
  const { userProperties, meetingProperties, setUserProperties, setMeetingProperties } = useContext(SpaceContext);
  const { sendAppData, replaceVideoTracks } = useContext(ConnectionContext);
  const { localScreenStreamRef, getDisplayMedia, closeLocalScreenStream } = useContext(MediaContext);

  const stopShareScreen = useCallback(() => {
    replaceVideoTracks();
    closeLocalScreenStream();
    sendAppData({ code: 'stop_sharing_screen' });
    setUserProperties('shareScreen', false);
  }, [sendAppData, replaceVideoTracks, setUserProperties, closeLocalScreenStream]);

  const startShareScreen = useCallback(() => {
    getDisplayMedia()
      .then((mediaStream) => {
        replaceVideoTracks(mediaStream);

        mediaStream.getTracks().forEach((track) => {
          if (track.kind !== 'video') return;

          track.onended = () => {
            stopShareScreen();
            setUserProperties('shareScreen', false);
          };
        });

        localScreenStreamRef.current = mediaStream;
        sendAppData({ code: 'start_sharing_screen' });
        setUserProperties('shareScreen', true);
        setMeetingProperties('userInFocusId', userId);
      })
      .catch((err) => {
        console.warn('cannot share the screen');
        console.warn(err);

        setUserProperties('shareScreen', false);
      });
  }, [
    localScreenStreamRef,
    userId,
    replaceVideoTracks,
    getDisplayMedia,
    setUserProperties,
    setMeetingProperties,
    stopShareScreen,
    sendAppData,
  ]);

  const toggleShareScreen = () => {
    if (userProperties.shareScreen) {
      stopShareScreen();
      if (meetingProperties.userInFocusId === userId) {
        setMeetingProperties('userInFocusId', undefined);
      }
    } else {
      startShareScreen();
    }
  };

  return {
    toggleShareScreen,
  };
};
