'use client';

import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { useMedia } from '../use-media';

export const useNewSpace = () => {
  const { socket } = useContext(SocketIoContext);
  const {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    retrieveMediaDevices,
    getUserMedia,
  } = useMedia();
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const [mediaAllowed, setMediaAllowed] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  const createNewSpaceHandler = () => {
    sessionStorage.setItem('name', name);
    sessionStorage.setItem('audioDevice', selectedAudioDevice);
    sessionStorage.setItem('videoDevice', selectedVideoDevice);

    socket?.on('space-created', ({ id }) => {
      router.push(`/spaces/${id}`);
    });

    socket?.emit('create-space');
    setIsSubmitting(true);
  };

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
        setMediaAllowed(true);
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
        setMediaAllowed(true);
        setSelectedVideoDevice(event.target.value);
      })
      .catch((err) => {
        console.warn('cannot get the user media');
        console.warn(err);
      });
  };

  useEffect(() => {
    getUserMedia({
      video: true,
      audio: true,
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setMediaAllowed(true);
        setName(localStorage.getItem('name') ?? '');

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
    isSubmitting,
    mediaAllowed,
    name,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice: selectedAudioDeviceHandler,
    setSelectedVideoDevice: selectedVideoDeviceHandler,
    setName,
    createNewSpaceHandler,
    registerVideoRef,
  };
};
