'use client';

import { ApplicationProvider } from './ApplicationProvider';
import { ChatProvider } from './ChatProvider';
import { ConnectionProvider } from './ConnectionProvider';
import { MediaProvider } from './MediaProvider';
import { ModalConfigureMeeting } from './ModalConfigureMeeting';
import { ModalRequireMedia } from './ModalRequireMedia';
import { SocketListenersProvider } from './SocketListenersProvider';
import { SpaceCanvas } from './SpaceCanvas';
import { SpaceProvider } from './SpaceProvider';
import { UserOverlay } from './UserOverlay';

type SpacePageProps = {
  spaceId: string;
};

export const SpacePage = ({ spaceId }: SpacePageProps) => {
  return (
    <ApplicationProvider spaceId={spaceId}>
      <MediaProvider>
        <ConnectionProvider>
          <SpaceProvider>
            <ChatProvider>
              <SocketListenersProvider>
                <div className="relative h-full w-full">
                  <SpaceCanvas />
                  <UserOverlay />
                  <ModalConfigureMeeting />
                  <ModalRequireMedia />
                </div>
              </SocketListenersProvider>
            </ChatProvider>
          </SpaceProvider>
        </ConnectionProvider>
      </MediaProvider>
    </ApplicationProvider>
  );
};
