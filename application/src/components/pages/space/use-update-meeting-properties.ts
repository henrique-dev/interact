'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { MediaContext } from './MediaProvider';
import { SpaceContext } from './SpaceProvider';

export const useUpdateMeetingProperties = () => {
  const { setUserName } = useContext(SpaceContext);
  const mediaStreamRef = useRef<MediaStream>(null);
  const {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    getUserMedia,
    retrieveMediaDevices,
  } = useContext(MediaContext);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [mediaAllowed, setMediaAllowed] = useState<boolean | null>(null);
  const [name, setName] = useState('');

  const registerVideoRef = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (videoElement.srcObject !== mediaStreamRef.current) {
        videoElement.srcObject = mediaStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  const selectedAudioDeviceHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    getUserMedia({
      video: { deviceId: { exact: selectedVideoDevice } },
      audio: { deviceId: { exact: event.target.value } },
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setSelectedAudioDevice(event.target.value);
      })
      .catch((err) => {
        console.warn('cannot get the user media');
        console.warn(err);
      });
  };

  const selectedVideoDeviceHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    getUserMedia({
      video: { deviceId: { exact: event.target.value } },
      audio: { deviceId: { exact: selectedAudioDevice } },
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setSelectedVideoDevice(event.target.value);
      })
      .catch((err) => {
        console.warn('cannot get the user media');
        console.warn(err);
      });
  };

  const submitHandler = () => {
    sessionStorage.setItem('name', name);
    sessionStorage.setItem('audioDevice', selectedAudioDevice);
    sessionStorage.setItem('videoDevice', selectedVideoDevice);
    setUserName(name);
  };

  useEffect(() => {
    getUserMedia({
      video: true,
      audio: true,
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setMediaAllowed(true);

        setName(sessionStorage.getItem('name') ?? '');

        retrieveMediaDevices(true).catch((err) => {
          setMediaAllowed(false);
          console.warn('cannot get the user devices');
          console.warn(err);
        });
      })
      .catch((err) => {
        setMediaAllowed(false);
        console.warn('cannot get the user media');
        console.warn(err);
      });

    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;

      const videoElement = videoElementRef.current;

      if (!videoElement) return;

      const mediaStream = videoElement.srcObject as MediaStream;

      mediaStream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [setMediaAllowed, getUserMedia, retrieveMediaDevices]);

  return {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    name,
    mediaAllowed,
    setSelectedAudioDevice: selectedAudioDeviceHandler,
    setSelectedVideoDevice: selectedVideoDeviceHandler,
    registerVideoRef,
    setName,
    submitHandler,
  };
};
