import { GameButton } from '@/components/ui/buttons';
import { Chip, Input, Modal, ModalBody, ModalContent, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { SpaceContext } from './SpaceProvider';
import { useUpdateMeetingProperties } from './use-update-meeting-properties';

export const ModalConfigureMeeting = () => {
  const { isModalConfigureMeetingOpen } = useContext(SpaceContext);
  const {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    name,
    mediaAllowed,
    registerVideoRef,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setName,
    submitHandler,
  } = useUpdateMeetingProperties();
  const router = useRouter();
  const t = useTranslations();

  const disableSubmit = name.trim() === '' || !mediaAllowed || selectedAudioDevice.trim() === '' || selectedVideoDevice.trim() === '';

  return (
    <>
      <Modal
        isOpen={isModalConfigureMeetingOpen}
        hideCloseButton
        classNames={{
          body: 'bg-zinc-900/90',
          base: 'bg-opacity',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody className="py-4">
                {mediaAllowed === null && (
                  <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
                    <Spinner size="lg" />
                  </div>
                )}
                {mediaAllowed === false && (
                  <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
                    <Chip>{t('pages.space.modal_enter_name.need_to_allow_media')}</Chip>
                  </div>
                )}
                {mediaAllowed && (
                  <div className="w-full overflow-hidden rounded-lg bg-zinc-600">
                    <video ref={registerVideoRef} autoPlay playsInline />
                  </div>
                )}
                <div className="flex w-full flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Input label={t('pages.space.modal_enter_name.name')} value={name} onValueChange={setName} isDisabled={!mediaAllowed} />
                    <Select
                      label={t('pages.space.modal_enter_name.select_audio_device')}
                      disallowEmptySelection
                      selectedKeys={[selectedAudioDevice]}
                      onChange={setSelectedAudioDevice}
                      isDisabled={!mediaAllowed}
                    >
                      {audioDevices.map((device) => (
                        <SelectItem key={device.id}>{device.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      label={t('pages.space.modal_enter_name.select_video_device')}
                      disallowEmptySelection
                      selectedKeys={[selectedVideoDevice]}
                      onChange={setSelectedVideoDevice}
                      isDisabled={!mediaAllowed}
                    >
                      {videoDevices.map((device) => (
                        <SelectItem key={device.id}>{device.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <GameButton buttonColor="blue" onClick={submitHandler} disabled={disableSubmit}>
                    {t('pages.space.modal_enter_name.start_meeting')}
                  </GameButton>
                  <GameButton onClick={router.push.bind(null, '/meetings', {})} buttonColor="purple">
                    {t('pages.space.modal_enter_name.exit')}
                  </GameButton>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
