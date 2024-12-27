import React, { useCallback, useRef } from 'react';
import { DeviceType, useMedia } from '../use-media';

type MediaContextProps = {
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
  localStreamRef: React.RefObject<MediaStream | null>;
  localScreenStreamRef: React.RefObject<MediaStream | null>;
  disableShareScreen: boolean;
  audioDevices: DeviceType[];
  videoDevices: DeviceType[];
  selectedAudioDevice: string;
  selectedVideoDevice: string;
  getDisplayMedia: () => Promise<MediaStream>;
  retrieveMediaDevices: (setDefaultDevices?: boolean) => Promise<unknown>;
  getUserMedia: (props?: {
    video: boolean | MediaTrackConstraints | undefined;
    audio: boolean | MediaTrackConstraints | undefined;
  }) => Promise<MediaStream>;
  closeAllLocalStreams: () => void;
  closeLocalScreenStream: () => void;
  setSelectedAudioDevice: React.Dispatch<React.SetStateAction<string>>;
  setSelectedVideoDevice: React.Dispatch<React.SetStateAction<string>>;
};

export const MediaContext = React.createContext<MediaContextProps>({
  videoElementRef: { current: null },
  localStreamRef: { current: null },
  localScreenStreamRef: { current: null },
  disableShareScreen: false,
  audioDevices: [],
  videoDevices: [],
  selectedAudioDevice: '',
  selectedVideoDevice: '',
  getUserMedia: () => new Promise<MediaStream>(() => undefined),
  getDisplayMedia: () => new Promise<MediaStream>(() => undefined),
  retrieveMediaDevices: () => new Promise<MediaStream>(() => undefined),
  closeAllLocalStreams: () => undefined,
  closeLocalScreenStream: () => undefined,
  setSelectedAudioDevice: () => undefined,
  setSelectedVideoDevice: () => undefined,
});

type MediaProviderProps = {
  children: React.ReactNode;
};

export const MediaProvider = ({ children }: MediaProviderProps) => {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>(null);
  const localScreenStreamRef = useRef<MediaStream>(null);
  const {
    disableShareScreen,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    getDisplayMedia,
    retrieveMediaDevices,
    getUserMedia,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
  } = useMedia();

  const closeLocalScreenStream = useCallback(() => {
    localScreenStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localScreenStreamRef.current = null;
  }, []);

  const closeAllLocalStreams = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;

    closeLocalScreenStream();

    const videoElement = videoElementRef.current;

    if (!videoElement) return;

    (videoElement.srcObject as MediaStream)?.getTracks().forEach((track) => {
      track.stop();
    });
  }, [closeLocalScreenStream]);

  return (
    <MediaContext.Provider
      value={{
        videoElementRef,
        localStreamRef,
        localScreenStreamRef,
        disableShareScreen,
        audioDevices,
        videoDevices,
        selectedAudioDevice,
        selectedVideoDevice,
        getUserMedia,
        getDisplayMedia,
        retrieveMediaDevices,
        closeAllLocalStreams,
        closeLocalScreenStream,
        setSelectedAudioDevice,
        setSelectedVideoDevice,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
