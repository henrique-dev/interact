import { AudioButton } from './AudioButton';
import { ChatButton } from './ChatButton';
import { ConfigButton } from './ConfigButton';
import { ExitButton } from './ExitButton';
import { LinkCopy } from './LinkCopy';
import { ShareScreenButton } from './ShareScreenButton';
import { VideoButton } from './VideoButton';

export const MeetingBar = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <LinkCopy />
      <AudioButton />
      <VideoButton />
      <ShareScreenButton />
      <ChatButton />
      <ConfigButton />
      <ExitButton />
    </div>
  );
};
