import React, { useCallback, useContext, useRef } from 'react';
import { MediaContext } from './MediaProvider';
import { useChannelSubscribers } from './use-channel-subscribers';

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
};

type UserConnectionMapType = {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  appDataChannel: RTCDataChannel;
  chatDataChannel: RTCDataChannel;
  fileDataChannel: RTCDataChannel;
  state: 'idle' | 'created';
};

type ConnectionContextProps = {
  userConnectionsMapRef: React.RefObject<Map<string, UserConnectionMapType>>;
  sendAppData: (data: {}) => void;
  sendChatData: (data: string) => void;
  sendFileData: (data: {}) => void;
  createSenderFileChannel: (name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => void;
  createReceiverFileChannel: (userId: string, name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => void;
  createConnection: (userId: string) => RTCPeerConnection | undefined;
  getConnection: (userId: string) => UserConnectionMapType | undefined;
  removeConnection: (userId: string) => void;
  removeConnections: () => void;
  closeAllConnections: () => void;
  appSubscribe: (eventHandler: (data: { userId: string; payload: string }) => void) => () => void;
  chatSubscribe: (eventHandler: (data: { userId: string; payload: string }) => void) => () => void;
  fileSubscribe: (eventHandler: (data: { userId: string; payload: string }) => void) => () => void;
  createOffer: (
    userId: string,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ) => Promise<[true, RTCSessionDescriptionInit] | [false, undefined]>;
  createAnswer: (
    userId: string,
    offer: RTCSessionDescriptionInit,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ) => Promise<[true, RTCSessionDescriptionInit] | [false, undefined]>;
  updateAnswer: (userId: string, answer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  addIceCandidate: (userId: string, params: RTCIceCandidateInit) => Promise<RTCIceCandidate>;
  updateLocalStream: (props?: {
    video: boolean | MediaTrackConstraints | undefined;
    audio: boolean | MediaTrackConstraints | undefined;
  }) => Promise<MediaStream>;
  replaceVideoTracks: (mediaStream?: MediaStream | null) => void;
};

export const ConnectionContext = React.createContext<ConnectionContextProps>({
  userConnectionsMapRef: { current: new Map() },
  sendAppData: () => undefined,
  sendChatData: () => undefined,
  sendFileData: () => undefined,
  createSenderFileChannel: () => undefined,
  createReceiverFileChannel: () => undefined,
  createConnection: () => new RTCPeerConnection(),
  getConnection: () => undefined,
  removeConnection: () => undefined,
  removeConnections: () => undefined,
  closeAllConnections: () => undefined,
  appSubscribe: () => () => undefined,
  chatSubscribe: () => () => undefined,
  fileSubscribe: () => () => undefined,
  createOffer: () => new Promise(() => undefined),
  createAnswer: () => new Promise(() => undefined),
  updateAnswer: () => new Promise(() => undefined),
  addIceCandidate: () => new Promise(() => undefined),
  updateLocalStream: () => new Promise(() => undefined),
  replaceVideoTracks: () => undefined,
});

type ConnectionProviderProps = {
  children: React.ReactNode;
};

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
  const { localStreamRef, getUserMedia } = useContext(MediaContext);
  const userConnectionsMapRef = useRef<Map<string, UserConnectionMapType>>(new Map());
  const { appEmitter, chatEmitter, fileEmitter, appSubscribe, chatSubscribe, fileSubscribe } = useChannelSubscribers();

  const sendAppData = useCallback(
    (data: {}) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.appDataChannel.send(JSON.stringify(data));
      });
    },
    [userConnectionsMapRef]
  );

  const sendChatData = useCallback(
    (data: string) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.chatDataChannel.send(data);
      });
    },
    [userConnectionsMapRef]
  );

  const sendFileData = useCallback(
    (data: {}) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.fileDataChannel.send(JSON.stringify(data));
      });
    },
    [userConnectionsMapRef]
  );

  const createSenderFileChannel = useCallback((name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => {
    userConnectionsMapRef.current.forEach((userConnection) => {
      userConnection.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;

        if (channel.label === name) {
          channel.onopen = () => {
            onOpen(channel);
          };
        }
      };
    });
  }, []);

  const createReceiverFileChannel = useCallback(
    (userId: string, name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => {
      const userConnection = userConnectionsMapRef.current.get(userId);

      if (!userConnection) return;

      const fileTransferChannel = userConnection.peerConnection.createDataChannel(name, { ordered: true });

      fileTransferChannel.onopen = () => {
        onOpen(fileTransferChannel);
      };
    },
    []
  );

  const createConnection = useCallback(
    (userId: string) => {
      if (userConnectionsMapRef.current.has(userId)) return;

      const localStream = localStreamRef.current;
      const peerConnection = new RTCPeerConnection(peerConfiguration);
      const remoteStream = new MediaStream();

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      const appDataChannel = peerConnection.createDataChannel('app', { negotiated: true, id: 0 });
      const chatDataChannel = peerConnection.createDataChannel('chat', { negotiated: true, id: 1 });
      const fileDataChannel = peerConnection.createDataChannel('file', { negotiated: true, id: 2 });

      appDataChannel.onmessage = (channelEvent) => {
        appEmitter(userId, channelEvent.data);
      };

      chatDataChannel.onmessage = (channelEvent) => {
        chatEmitter(userId, channelEvent.data);
      };

      fileDataChannel.onmessage = (channelEvent) => {
        fileEmitter(userId, channelEvent.data);
      };

      userConnectionsMapRef.current.set(userId, {
        peerConnection: peerConnection,
        appDataChannel,
        chatDataChannel,
        fileDataChannel,
        stream: remoteStream,
        state: 'idle',
      });

      return peerConnection;
    },
    [localStreamRef, appEmitter, chatEmitter, fileEmitter]
  );

  const getConnection = useCallback((userId: string) => {
    return userConnectionsMapRef.current.get(userId);
  }, []);

  const removeConnection = useCallback((userId: string) => {
    const userConnection = userConnectionsMapRef.current.get(userId);

    if (!userConnection) return;

    userConnection.peerConnection.close();

    userConnectionsMapRef.current.delete(userId);
  }, []);

  const removeConnections = useCallback(() => {
    userConnectionsMapRef.current.forEach((userConnection) => {
      userConnection.peerConnection.close();
    });

    userConnectionsMapRef.current.clear();
  }, []);

  const closeAllConnections = useCallback(() => {
    userConnectionsMapRef.current.forEach((userConnection) => {
      userConnection.peerConnection.close();
    });
  }, []);

  const createOffer = useCallback(
    (
      userId: string,
      onIceCandidate: (candidate: RTCIceCandidate) => void
    ): Promise<[true, RTCSessionDescriptionInit] | [false, undefined]> => {
      return new Promise(async (resolve, reject) => {
        const userConnection = userConnectionsMapRef.current.get(userId);

        if (!userConnection || userConnection.state !== 'idle') {
          return resolve([false, undefined]);
        }

        userConnection.state = 'created';

        userConnection.peerConnection.onicecandidate = ({ candidate }) => {
          if (!candidate) return;

          onIceCandidate(candidate);
        };

        try {
          const offerDescription = await userConnection.peerConnection.createOffer();
          await userConnection.peerConnection.setLocalDescription(offerDescription);

          resolve([true, offerDescription]);
        } catch (err) {
          reject(err);
        }
      });
    },
    []
  );

  const createAnswer = useCallback(
    (
      userId: string,
      offer: RTCSessionDescriptionInit,
      onIceCandidate: (candidate: RTCIceCandidate) => void
    ): Promise<[true, RTCSessionDescriptionInit] | [false, undefined]> => {
      return new Promise(async (resolve, reject) => {
        const userConnection = userConnectionsMapRef.current.get(userId);

        if (!userConnection) {
          return resolve([false, undefined]);
        }

        userConnection.peerConnection.onicecandidate = ({ candidate }) => {
          if (!candidate) return;

          onIceCandidate(candidate);
        };

        userConnection.peerConnection.setRemoteDescription(offer);

        try {
          const answerDescription = await userConnection.peerConnection.createAnswer();
          await userConnection.peerConnection.setLocalDescription(answerDescription);

          resolve([true, answerDescription]);
        } catch (err) {
          reject(err);
        }
      });
    },
    []
  );

  const updateAnswer = useCallback((userId: string, answer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> => {
    return new Promise((resolve, reject) => {
      try {
        const userConnection = userConnectionsMapRef.current.get(userId);

        const answerDescription = new RTCSessionDescription(answer);
        userConnection?.peerConnection.setRemoteDescription(answerDescription);

        resolve(answerDescription);
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const addIceCandidate = useCallback((userId: string, params: RTCIceCandidateInit): Promise<RTCIceCandidate> => {
    return new Promise((resolve, reject) => {
      try {
        const userConnection = userConnectionsMapRef.current.get(userId);

        const candidate = new RTCIceCandidate(params);
        userConnection?.peerConnection.addIceCandidate(candidate);

        resolve(candidate);
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const updateLocalStream = async (props?: {
    video: boolean | MediaTrackConstraints | undefined;
    audio: boolean | MediaTrackConstraints | undefined;
  }): Promise<MediaStream> => {
    return new Promise(async (resolve, reject) => {
      try {
        const localStream = await getUserMedia(props);

        userConnectionsMapRef.current.forEach((userConnection) => {
          const senders = userConnection.peerConnection.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === 'video');
          const audioSender = senders.find((sender) => sender.track?.kind === 'audio');

          localStream.getTracks().forEach((track) => {
            if (track.kind === 'video' && videoSender) {
              videoSender.replaceTrack(track);
            }
            if (track.kind === 'audio' && audioSender) {
              audioSender.replaceTrack(track);
            }
          });
        });

        localStreamRef.current = localStream;

        resolve(localStream);
      } catch (err) {
        console.warn('cannot get the media');
        console.warn(err);
        reject();
      }
    });
  };

  const replaceVideoTracks = useCallback(
    (mediaStream = localStreamRef.current) => {
      userConnectionsMapRef.current.forEach((userConnection) => {
        const senders = userConnection.peerConnection.getSenders();
        const videoSender = senders.find((sender) => sender.track?.kind === 'video');

        if (!videoSender) return;

        mediaStream?.getTracks().forEach((track) => {
          if (track.kind !== 'video') return;

          if (videoSender) {
            videoSender.replaceTrack(track);
          }
        });
      });
    },
    [localStreamRef]
  );

  return (
    <ConnectionContext.Provider
      value={{
        userConnectionsMapRef,
        sendAppData,
        sendChatData,
        sendFileData,
        createReceiverFileChannel,
        createSenderFileChannel,
        createConnection,
        getConnection,
        removeConnection,
        removeConnections,
        closeAllConnections,
        appSubscribe,
        chatSubscribe,
        fileSubscribe,
        createOffer,
        createAnswer,
        updateAnswer,
        addIceCandidate,
        updateLocalStream,
        replaceVideoTracks,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
