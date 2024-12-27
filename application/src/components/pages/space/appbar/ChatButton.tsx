import { GameButton } from '@/components/ui/buttons';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import { ChatContext } from '../ChatProvider';

export const ChatButton = () => {
  const { haveUnreadMessages, setIsChatVisible } = useContext(ChatContext);

  return (
    <GameButton onClick={setIsChatVisible.bind(null, true)} buttonColor={haveUnreadMessages ? 'purple' : 'blue'}>
      <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
    </GameButton>
  );
};
