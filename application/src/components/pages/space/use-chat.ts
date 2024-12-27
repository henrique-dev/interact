import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useContext, useRef, useState } from 'react';
import { ChatContext } from './ChatProvider';
import { SpaceContext } from './SpaceProvider';

export const useChat = () => {
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const { userId } = useContext(SocketIoContext);
  const { userName } = useContext(SpaceContext);
  const { sendMessage, sendFile } = useContext(ChatContext);
  const [messageToSend, setMessageToSend] = useState('');
  const [file, setFile] = useState('');
  const [fileToSend, setFileToSend] = useState<File>();

  const sendMessageHandler = () => {
    if (messageToSend.trim() !== '') {
      sendMessage({ id: crypto.randomUUID(), delivered: true, kind: 'text', from: userName, message: messageToSend, userId });
      setMessageToSend('');
    }
    if (fileToSend) {
      sendFile(fileToSend);
      setFileToSend(undefined);
      setFile('');
    }
  };

  const onKeyDownHandler = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && !event.shiftKey && messageToSend.trim() !== '') {
      event.preventDefault();

      sendMessageHandler();
    }
  };

  const onAttachmentButtonClickHandler = () => {
    attachmentInputRef.current?.click();
  };

  const setFileToSendHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.currentTarget.files) return;

    const localFile = event.currentTarget.files[0];

    setFile(event.currentTarget.value);

    setFileToSend(localFile);
  };

  return {
    messageToSend,
    attachmentInputRef,
    file,
    fileToSend,
    setFile: setFileToSendHandler,
    setMessageToSend,
    sendMessage: sendMessageHandler,
    onKeyDownHandler,
    onAttachmentButtonClickHandler,
  };
};
