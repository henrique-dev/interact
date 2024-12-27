import { GameButton } from '@/components/ui/buttons';
import { Modal, ModalBody, ModalContent, Select, SelectItem } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { MediaContext } from '../MediaProvider';
import { SpaceContext } from '../SpaceProvider';
import { useVideoElementRefs } from '../use-video-element-refs';
import { useAudioOptions } from './use-audio-options';
import { useVideoOptions } from './use-video-options';

type ModalConfigureMediaProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const ModalConfigureMedia = ({ isOpen, setIsOpen }: ModalConfigureMediaProps) => {
  const { audioDevices, videoDevices } = useContext(MediaContext);
  const { localVideoRefHandler } = useVideoElementRefs();
  const { userProperties } = useContext(SpaceContext);
  const { changeAudioDeviceHandler } = useAudioOptions();
  const { changeVideoDeviceHandler } = useVideoOptions();
  const t = useTranslations();

  return (
    <>
      <Modal
        isOpen={isOpen}
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
                <div className="w-full overflow-hidden rounded-lg bg-zinc-600">
                  <video ref={localVideoRefHandler} autoPlay playsInline />
                </div>
                <div className="flex w-full flex-col space-y-4">
                  <div className="space-y-2">
                    <Select
                      label={t('pages.space.modal_configure_media.select_audio_device')}
                      disallowEmptySelection
                      selectedKeys={[userProperties.audioDevice]}
                      onChange={changeAudioDeviceHandler}
                    >
                      {audioDevices.map((device) => (
                        <SelectItem key={device.id}>{device.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      label={t('pages.space.modal_configure_media.select_video_device')}
                      disallowEmptySelection
                      selectedKeys={[userProperties.videoDevice]}
                      onChange={changeVideoDeviceHandler}
                    >
                      {videoDevices.map((device) => (
                        <SelectItem key={device.id}>{device.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <GameButton onClick={setIsOpen.bind(null, false)} buttonColor="gray">
                    {t('pages.space.modal_configure_media.back')}
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
