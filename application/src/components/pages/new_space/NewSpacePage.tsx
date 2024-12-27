'use client';

import { GameButton } from '@/components/ui/buttons';
import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Alert, Chip, Input, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';
import { useTranslations } from 'use-intl';
import { useNewSpace } from './use-new-space';

export const NewSpacePage = () => {
  const { isConnected } = useContext(SocketIoContext);
  const {
    isSubmitting,
    mediaAllowed,
    name,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setName,
    registerVideoRef,
    createNewSpaceHandler,
  } = useNewSpace();
  const router = useRouter();
  const t = useTranslations();

  const configuredMedia = selectedAudioDevice.trim() !== '' && selectedVideoDevice.trim() !== '';

  const disableSubmit = name.trim() === '' || !mediaAllowed || !isConnected || isSubmitting || !configuredMedia;

  return (
    <div className={twJoin('flex h-full w-full flex-col items-center justify-center')}>
      <div
        className={twJoin(
          'z-10 flex flex-col items-center justify-center shadow-2xl',
          'h-full w-full space-y-4 rounded-lg bg-zinc-900/90 p-4 sm:h-min sm:max-w-96'
        )}
      >
        <h1 className="text-3xl text-white">AniMeet</h1>
        {mediaAllowed === null && (
          <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
            <Spinner size="lg" />
          </div>
        )}
        {mediaAllowed === false && (
          <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
            <Chip>{t('pages.new_space.new_space_page.need_to_allow_media')}</Chip>
          </div>
        )}
        {mediaAllowed && (
          <div className="w-full overflow-hidden rounded-lg bg-zinc-600">
            <video ref={registerVideoRef} autoPlay playsInline />
          </div>
        )}
        <div className="flex w-full flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <Input label={t('pages.new_space.new_space_page.name')} value={name} onValueChange={setName} isDisabled={isSubmitting} />
            <Select
              label={t('pages.new_space.new_space_page.select_audio_device')}
              disallowEmptySelection
              selectedKeys={[selectedAudioDevice]}
              onChange={setSelectedAudioDevice}
              isDisabled={isSubmitting}
            >
              {audioDevices.map((device) => (
                <SelectItem key={device.id}>{device.name}</SelectItem>
              ))}
            </Select>
            <Select
              label={t('pages.new_space.new_space_page.select_video_device')}
              disallowEmptySelection
              selectedKeys={[selectedVideoDevice]}
              onChange={setSelectedVideoDevice}
              isDisabled={isSubmitting}
            >
              {videoDevices.map((device) => (
                <SelectItem key={device.id}>{device.name}</SelectItem>
              ))}
            </Select>
          </div>
          <GameButton onClick={createNewSpaceHandler} color="primary" disabled={disableSubmit} buttonColor="blue">
            {t('pages.new_space.new_space_page.start_space')}
          </GameButton>
          <GameButton onClick={router.push.bind(null, '/spaces', {})} buttonColor="purple">
            {t('pages.new_space.new_space_page.back')}
          </GameButton>
        </div>
        {isConnected === false && <Alert description={'Cannot connect to server at the moment'} title={'Disconnected'} color="danger" />}
      </div>
    </div>
  );
};
