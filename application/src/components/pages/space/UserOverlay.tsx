import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Spinner } from '@nextui-org/react';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';
import { MeetingBar } from './appbar/MeetingBar';
import { ApplicationContext } from './ApplicationProvider';
import { Chat } from './Chat';
import { useVideoElementRefs } from './use-video-element-refs';

export const UserOverlay = () => {
  const { userId } = useContext(SocketIoContext);
  const { meetingUsers } = useContext(ApplicationContext);
  const {
    screenInFocus,
    userInFocus,
    videoInFocusRefHandler,
    localVideoRefHandler,
    remoteVideoElementRefHandler,
    changeUserInFocusHandler,
  } = useVideoElementRefs();

  const showUserVideos = meetingUsers.length > 0;

  return (
    <div className="absolute top-0 z-50 flex h-full w-full p-8">
      <div className="flex h-full w-full flex-1 flex-col">
        <div className="flex h-full w-full flex-1 flex-col">
          {showUserVideos && (
            <div className="flex flex-1 flex-wrap justify-center gap-2">
              <div
                className={twJoin(
                  'flex items-center justify-center rounded-lg bg-zinc-900/90 p-2',
                  !screenInFocus && 'h-48 w-48',
                  screenInFocus && 'h-32 w-32'
                )}
              >
                <video
                  ref={localVideoRefHandler}
                  autoPlay
                  playsInline
                  className="w-48 hover:cursor-pointer"
                  onClick={changeUserInFocusHandler.bind(null, userId)}
                />
              </div>
              {meetingUsers.map((meetingUser) => {
                return (
                  <div
                    key={meetingUser.id}
                    className={twJoin(
                      'relative flex items-center justify-center rounded-lg bg-zinc-900/90 p-2',
                      !screenInFocus && 'h-48 w-48',
                      screenInFocus && 'h-32 w-32'
                    )}
                  >
                    {meetingUser.state === 'connected' && (
                      <video
                        ref={remoteVideoElementRefHandler.bind(null, meetingUser.id)}
                        autoPlay
                        playsInline
                        className="w-48 hover:cursor-pointer"
                        onClick={changeUserInFocusHandler.bind(null, userId)}
                      />
                    )}
                    {meetingUser.state === 'connecting' && <Spinner size="lg" color="white" />}
                    <div className="absolute bottom-0 flex w-full justify-center">
                      <div className="m-2 overflow-hidden text-ellipsis rounded-lg bg-zinc-950/90 px-2 py-1">
                        <span className="text-nowrap p-2">{meetingUser.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {screenInFocus && (
            <div className={twJoin('relative m-5 flex h-full items-center justify-center rounded-lg')}>
              <div className="absolute h-full rounded-lg bg-zinc-900/90 p-2">
                <video ref={videoInFocusRefHandler} autoPlay playsInline className="h-full hover:cursor-pointer" />
              </div>
            </div>
          )}
        </div>
        <MeetingBar />
      </div>
      <Chat />
    </div>
  );
};
