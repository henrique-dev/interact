import { useCallback, useEffect, useState } from 'react';

export type DeviceType = {
  id: string;
  name: string;
};

export const useMedia = () => {
  const [disableShareScreen, setDisableShareScreen] = useState(false);
  const [videoDevices, setVideoDevices] = useState<DeviceType[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceType[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');

  const getUserMedia = useCallback(
    (props?: { video: boolean | MediaTrackConstraints | undefined; audio: boolean | MediaTrackConstraints | undefined }) => {
      if (!navigator.mediaDevices.getUserMedia) return Promise.reject();

      return navigator.mediaDevices.getUserMedia({
        video: props?.video ?? true,
        audio: props?.audio ?? true,
      });
    },
    []
  );

  const getDisplayMedia = useCallback(() => {
    if (!navigator.mediaDevices.getDisplayMedia) return Promise.reject();

    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
      // @ts-ignore
      surfaceSwitching: 'exclude',
    });
  }, []);

  const getDevices = useCallback(() => {
    if (!navigator.mediaDevices.enumerateDevices) return Promise.reject();

    return navigator.mediaDevices.enumerateDevices();
  }, []);

  const retrieveMediaDevices = useCallback(
    (setDefaultDevices?: boolean): Promise<[DeviceType[], DeviceType[]]> => {
      return new Promise(async (resolve, reject) => {
        try {
          const devices = await getDevices();

          const audioDevicesFound = devices
            .filter((device) => device.kind === 'audioinput')
            .map((device) => ({
              id: device.deviceId,
              name: device.label,
            }));

          const videoDevicesFound = devices
            .filter((device) => device.kind === 'videoinput')
            .map((device) => ({
              id: device.deviceId,
              name: device.label,
            }));

          if (setDefaultDevices) {
            if (audioDevicesFound.find((device) => device.id === 'default')) {
              setSelectedAudioDevice('default');
            } else if (audioDevicesFound.length > 0) {
              setSelectedAudioDevice(audioDevicesFound[0].id);
            }

            if (videoDevicesFound.find((device) => device.id === 'default')) {
              setSelectedVideoDevice('default');
            } else if (videoDevicesFound.length > 0) {
              setSelectedVideoDevice(videoDevicesFound[0].id);
            }
          }

          setAudioDevices(audioDevicesFound);
          setVideoDevices(videoDevicesFound);

          resolve([videoDevicesFound, audioDevicesFound]);
        } catch (err) {
          reject(err);
        }
      });
    },
    [getDevices, setSelectedAudioDevice, setSelectedVideoDevice, setAudioDevices, setVideoDevices]
  );

  useEffect(() => {
    setDisableShareScreen(navigator.mediaDevices.getDisplayMedia === undefined);
  }, [setDisableShareScreen]);

  return {
    disableShareScreen,
    videoDevices,
    audioDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setVideoDevices,
    setAudioDevices,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    getUserMedia,
    getDisplayMedia,
    getDevices,
    retrieveMediaDevices,
  };
};
