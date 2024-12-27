import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import React, { useCallback, useContext, useEffect } from 'react';
import { ApplicationContext, UserType } from './ApplicationProvider';
import { ConnectionContext } from './ConnectionProvider';
import { UserAction, UserEmitterType, useSocketSubscribers } from './use-socket-subscribers';

type SocketListenersContextProps = {
  userEmitter: UserEmitterType;
  userSubscribe: (action: UserAction, eventHandler: (data: { userId: string; payload: string }) => void) => () => void;
};

export const SocketListenersContext = React.createContext<SocketListenersContextProps>({
  userEmitter: () => undefined,
  userSubscribe: () => () => undefined,
});

type SocketListenersProviderProps = {
  children: React.ReactNode;
};

export const SocketListenersProvider = ({ children }: SocketListenersProviderProps) => {
  const { spaceId, addMeetingUser, updateMeetingUser, removeUser, removeMeetingUser, clearMeetingUsers } = useContext(ApplicationContext);
  const { socket, isConnected, userId } = useContext(SocketIoContext);
  const { createConnection, removeConnection, createOffer, createAnswer, updateAnswer, addIceCandidate, removeConnections } =
    useContext(ConnectionContext);
  const { userEmitter, userSubscribe } = useSocketSubscribers();
  const router = useRouter();

  const onUserLeaveSpace = useCallback(
    (user: UserType) => {
      removeUser(user);
      userEmitter(user.id, 'onuserleave');
    },
    [removeUser, userEmitter]
  );

  const onUserEnterSpace = useCallback(
    ({ users }: { users: UserType[] }) => {
      users.forEach((user) => {
        if (userId === '') return;
        if (user.id === userId) return;

        userEmitter(user.id, 'onuserenter', JSON.stringify(user));
      });
    },
    [userId, userEmitter]
  );

  const onUserLeaveMeeting = useCallback(
    ({ id }: { id: string }) => {
      removeConnection(id);
      removeMeetingUser(id);
    },
    [removeConnection, removeMeetingUser]
  );

  const onUserEnterMeeting = useCallback(
    ({ meetingId, users }: { meetingId: String; users: UserType[] }) => {
      users.forEach((user) => {
        if (userId === '') return;
        if (user.id === userId) return;

        const peerConnection = createConnection(user.id);

        if (!peerConnection) return;

        peerConnection.onconnectionstatechange = () => {
          switch (peerConnection.connectionState) {
            case 'closed':
              onUserLeaveMeeting(user);
              break;
            case 'connected':
              updateMeetingUser({ ...user, state: 'connected' });
              break;
            case 'connecting':
              addMeetingUser({ ...user, state: 'connecting' });
              break;
            case 'disconnected':
              onUserLeaveMeeting(user);
              break;
            case 'failed':
              onUserLeaveMeeting(user);
              break;
            case 'new':
              break;
          }
        };

        socket?.emit('decide-offer-answer', { meetingId, anotherUserId: user.id });
      });
    },
    [socket, userId, addMeetingUser, onUserLeaveMeeting, createConnection, updateMeetingUser]
  );

  const onCreateOffer = useCallback(
    async ({ meetingId, peerId }: { meetingId: string; peerId: string }) => {
      try {
        const [success, offer] = await createOffer(peerId, (candidate) => {
          socket?.emit('offer-candidates', { meetingId, toId: peerId, candidate });
        });

        if (success) {
          socket?.emit('offer', { meetingId, toId: peerId, offer });
        }
      } catch (err) {
        console.warn('cannot create the offer');
        console.warn(err);
      }
    },
    [socket, createOffer]
  );

  const onCreateAnswer = useCallback(
    async ({ meetingId, peerId, offer }: { meetingId: string; peerId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const [success, answer] = await createAnswer(peerId, offer, (candidate) => {
          socket?.emit('answer-candidates', { meetingId, toId: peerId, candidate });
        });

        if (success) {
          socket?.emit('answer', { meetingId, toId: peerId, answer });
        }
      } catch (err) {
        console.warn('cannot create the answer');
        console.warn(err);
      }
    },
    [createAnswer, socket]
  );

  const onAnswerFound = useCallback(
    ({ peerId, answer }: { peerId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        updateAnswer(peerId, answer);
      } catch (err) {
        console.warn('cannot handler the answer');
        console.warn(err);
      }
    },
    [updateAnswer]
  );

  const onOfferCandidate = useCallback(
    ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidateInit }) => {
      try {
        addIceCandidate(peerId, candidate);
      } catch (err) {
        console.warn('cannot add the offer ice candidate');
        console.warn(err);
      }
    },
    [addIceCandidate]
  );

  const onAnswerCandidate = useCallback(
    ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidateInit }) => {
      try {
        addIceCandidate(peerId, candidate);
      } catch (err) {
        console.warn('cannot add the answer ice candidate');
        console.warn(err);
      }
    },
    [addIceCandidate]
  );

  const onUserMove = useCallback(
    ({ payload }: { userId: string; payload: string }) => {
      const userData = JSON.parse(payload);
      socket?.emit('user-move', { spaceId, userData });
    },
    [socket, spaceId]
  );

  const onUserRequestToConnect = useCallback(
    ({ userId: otherUserId }: { userId: string }) => {
      socket?.emit('create-meeting', { spaceId, userId: otherUserId });
    },
    [socket, spaceId]
  );

  const onUserRequestToDisconnect = useCallback(() => {
    clearMeetingUsers();
    removeConnections();
    socket?.emit('leave-meeting', { spaceId });
  }, [socket, spaceId, clearMeetingUsers, removeConnections]);

  const onOtherUserMove = useCallback(
    ({ user, data }: { user: UserType; data: {} }) => {
      userEmitter(user.id, 'onusermoved', JSON.stringify(data));
    },
    [userEmitter]
  );

  const onInvalidSpace = useCallback(() => {
    router.push('/spaces');
  }, [router]);

  useEffect(() => {
    socket?.on('user-enter-space', onUserEnterSpace);
    socket?.on('user-leave-space', onUserLeaveSpace);
    socket?.on('user-move', onOtherUserMove);
    socket?.on('user-enter-meeting', onUserEnterMeeting);
    socket?.on('create-offer', onCreateOffer);
    socket?.on('create-answer', onCreateAnswer);
    socket?.on('answer-found', onAnswerFound);
    socket?.on('offer-candidate', onOfferCandidate);
    socket?.on('answer-candidate', onAnswerCandidate);
    socket?.on('user-leave-meeting', onUserLeaveMeeting);
    socket?.on('invalid-space', onInvalidSpace);

    return () => {
      socket?.off('user-enter-space', onUserEnterSpace);
      socket?.off('user-leave-space', onUserLeaveSpace);
      socket?.off('user-move', onOtherUserMove);
      socket?.off('user-enter-meeting', onUserEnterMeeting);
      socket?.off('create-offer', onCreateOffer);
      socket?.off('create-answer', onCreateAnswer);
      socket?.off('answer-found', onAnswerFound);
      socket?.off('offer-candidate', onOfferCandidate);
      socket?.off('answer-candidate', onAnswerCandidate);
      socket?.off('user-leave-meeting', onUserLeaveMeeting);
      socket?.off('invalid-space', onInvalidSpace);
    };
  }, [
    socket,
    isConnected,
    onUserEnterSpace,
    onUserLeaveSpace,
    onUserEnterMeeting,
    onUserLeaveMeeting,
    onOtherUserMove,
    onInvalidSpace,
    onAnswerCandidate,
    onAnswerFound,
    onCreateAnswer,
    onCreateOffer,
    onOfferCandidate,
  ]);

  useEffect(() => userSubscribe('onusermove', onUserMove), [userSubscribe, onUserMove]);
  useEffect(() => userSubscribe('onrequesttoconnect', onUserRequestToConnect), [userSubscribe, onUserRequestToConnect]);
  useEffect(() => userSubscribe('onrequesttodisconnect', onUserRequestToDisconnect), [userSubscribe, onUserRequestToDisconnect]);

  return <SocketListenersContext.Provider value={{ userEmitter, userSubscribe }}>{children}</SocketListenersContext.Provider>;
};
