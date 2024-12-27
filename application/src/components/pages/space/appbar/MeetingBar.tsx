import { AudioButton } from './AudioButton';
import { ChatButton } from './ChatButton';
import { ConfigButton } from './ConfigButton';
import { ExitButton } from './ExitButton';
import { ShareScreenButton } from './ShareScreenButton';
import { VideoButton } from './VideoButton';

export const MeetingBar = () => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <AudioButton />
      <VideoButton />
      <ShareScreenButton />
      <ChatButton />
      <ConfigButton />
      <ExitButton />
    </div>
  );
};
