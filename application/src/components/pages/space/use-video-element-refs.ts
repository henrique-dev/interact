import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useContext, useMemo } from 'react';
import { ApplicationContext } from './ApplicationProvider';
import { ConnectionContext } from './ConnectionProvider';
import { MediaContext } from './MediaProvider';
import { SpaceContext } from './SpaceProvider';

export const useVideoElementRefs = () => {
  const { getConnection } = useContext(ConnectionContext);
  const { videoElementRef, localStreamRef, localScreenStreamRef } = useContext(MediaContext);
  const { userProperties, meetingProperties, setMeetingProperties } = useContext(SpaceContext);
  const { userId } = useContext(SocketIoContext);
  const { meetingUsers } = useContext(ApplicationContext);

  const userInFocus = useMemo(
    () => meetingUsers.find((user) => user.id === meetingProperties.userInFocusId),
    [meetingUsers, meetingProperties]
  );
  const selfInFocus = !userInFocus && meetingProperties.userInFocusId === userId;

  const remoteVideoElementRefHandler = (remoteUserId: string, videoElement: HTMLVideoElement | null) => {
    const userConnection = getConnection(remoteUserId);

    if (!userConnection || !videoElement) return undefined;

    if (!videoElement.srcObject && localStreamRef.current) {
      videoElement.srcObject = userConnection.stream;
    }
  };

  const localVideoRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;

    if (userProperties.shareScreen) {
      if (videoElement.srcObject !== localScreenStreamRef.current) {
        videoElement.srcObject = localScreenStreamRef.current;
      }
    } else {
      if (videoElement.srcObject !== localStreamRef.current) {
        videoElement.srcObject = localStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  const videoInFocusRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (userInFocus) {
      remoteVideoElementRefHandler(userInFocus.id, videoElement);
    } else {
      localVideoRefHandler(videoElement);
    }
  };

  const changeUserInFocusHandler = (remoteUserId: string) => {
    if (meetingProperties.userInFocusId === remoteUserId) {
      setMeetingProperties('userInFocusId', undefined);
    } else {
      setMeetingProperties('userInFocusId', remoteUserId);
    }
  };

  return {
    userInFocus,
    screenInFocus: userInFocus || selfInFocus,
    remoteVideoElementRefHandler,
    localVideoRefHandler,
    videoInFocusRefHandler,
    changeUserInFocusHandler,
  };
};
