import { SocketIoContext } from '@/providers/SocketIoProvider';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ConnectionContext } from './ConnectionProvider';

type MessageType = {
  id: string;
  kind: 'text' | 'file';
  userId: string;
  from: string | null;
  message: string;
  delivered: boolean;
  url?: string;
};

type FileDataType = {
  code: 'create_file_channel';
  name: string;
  fileName: string;
  fileSize: number;
};

type ChatContextProps = {
  isChatVisible: boolean;
  messages: MessageType[];
  haveUnreadMessages: boolean;
  setIsChatVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  sendMessage: (message: MessageType) => void;
  sendFile: (file: File) => void;
};

export const ChatContext = React.createContext<ChatContextProps>({
  isChatVisible: false,
  messages: [],
  haveUnreadMessages: false,
  setIsChatVisible: () => undefined,
  setMessages: () => undefined,
  sendMessage: () => undefined,
  sendFile: () => undefined,
});

const splitFile = (file: File, chunkSize: number = 16384) => {
  const chunks = [];
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }

  return chunks;
};

type ChatProviderProps = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { userId } = useContext(SocketIoContext);
  const { chatSubscribe, fileSubscribe, sendChatData, sendFileData, createReceiverFileChannel, createSenderFileChannel } =
    useContext(ConnectionContext);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [haveUnreadMessages, setHaveUnreadMessages] = useState(false);
  const receivedFilesRef = useRef<Map<string, FileDataType>>(new Map());

  const sendMessage = useCallback(
    (message: MessageType) => {
      const dataToSend = JSON.stringify(message);

      sendChatData(dataToSend);

      setMessages((oldMessages) => [...oldMessages, message]);
    },
    [sendChatData, setMessages]
  );

  const sendFile = useCallback(
    async (file: File) => {
      const chunks = splitFile(file);
      const channelName = `${userId}_${crypto.randomUUID()}`;

      const fileReader = new FileReader();

      const sendChunk = () => {
        const chunk = chunks.pop();

        if (chunk) {
          fileReader.readAsArrayBuffer(chunk);
        } else {
          setMessages((oldMessages) => {
            const newMessages = [...oldMessages];
            const fileMessageIndex = oldMessages.findIndex((message) => message.id === channelName);

            if (fileMessageIndex >= 0) {
              newMessages[fileMessageIndex] = {
                ...newMessages[fileMessageIndex],
                delivered: true,
              };
            }

            return [...newMessages];
          });
        }
      };

      createSenderFileChannel(channelName, {
        onOpen: (channel) => {
          channel.onmessage = (event) => {
            if (event.data === 'ready_to_receive') {
              fileReader.onload = (progressEvent) => {
                const result = progressEvent.target?.result;

                if (result) {
                  if (typeof result === 'string') {
                    channel.send(result);
                  } else {
                    channel.send(result);
                  }
                }

                const timer = setTimeout(() => {
                  sendChunk();
                  clearTimeout(timer);
                }, 20);
              };
            }
            if (event.data === 'close_channel') {
              channel.close();
            }

            sendChunk();
          };
        },
      });

      sendFileData({
        code: 'create_file_channel',
        name: channelName,
        fileName: file.name,
        fileSize: chunks.length,
      });

      setMessages((oldMessages) => [
        ...oldMessages,
        { id: channelName, from: '', message: file.name, userId, delivered: false, kind: 'file' },
      ]);
    },
    [userId, setMessages, createSenderFileChannel, sendFileData]
  );

  const onDataChatReceived = useCallback(
    (data: { userId: string; payload: string }) => {
      const { from, message } = JSON.parse(data.payload);

      setMessages((oldMessages) => [
        ...oldMessages,
        { id: crypto.randomUUID(), from, message, userId: data.userId, delivered: true, kind: 'text' },
      ]);

      setHaveUnreadMessages(true);
    },
    [setMessages, setHaveUnreadMessages]
  );

  const onDataFileReceived = useCallback(
    (data: { userId: string; payload: string }) => {
      const params: FileDataType = JSON.parse(data.payload);

      receivedFilesRef.current.set(params.name, params);

      switch (params.code) {
        case 'create_file_channel':
          createReceiverFileChannel(data.userId, params.name, {
            onOpen: (channel) => {
              const fileToReceive = receivedFilesRef.current.get(params.name);

              if (!fileToReceive) return;

              const receiveBuffer: string[] = [];

              channel.onmessage = (messageEvent) => {
                receiveBuffer.push(messageEvent.data);

                if (receiveBuffer.length === fileToReceive?.fileSize) {
                  const fileReceived = new Blob(receiveBuffer.reverse());

                  channel.send('close_channel');

                  channel.close();

                  receivedFilesRef.current.delete(params.name);

                  setMessages((oldMessages) => {
                    const newMessages = [...oldMessages];
                    const fileMessageIndex = oldMessages.findIndex((message) => message.id === fileToReceive.name);

                    if (fileMessageIndex >= 0) {
                      newMessages[fileMessageIndex] = {
                        ...newMessages[fileMessageIndex],
                        delivered: true,
                        url: URL.createObjectURL(fileReceived),
                      };
                    }

                    return [...newMessages];
                  });
                }
              };

              channel.send('ready_to_receive');

              setMessages((oldMessages) => [
                ...oldMessages,
                { id: fileToReceive.name, from: '', message: fileToReceive.fileName, userId: data.userId, delivered: false, kind: 'file' },
              ]);
            },
          });
          break;
      }
    },
    [createReceiverFileChannel]
  );

  useEffect(() => {
    if (isChatVisible && haveUnreadMessages) {
      setHaveUnreadMessages(false);
    }
  }, [isChatVisible, haveUnreadMessages, setHaveUnreadMessages]);

  useEffect(() => chatSubscribe(onDataChatReceived), [chatSubscribe, onDataChatReceived]);
  useEffect(() => fileSubscribe(onDataFileReceived), [fileSubscribe, onDataFileReceived]);

  return (
    <ChatContext.Provider
      value={{
        isChatVisible,
        messages,
        haveUnreadMessages,
        setIsChatVisible,
        setMessages,
        sendMessage,
        sendFile,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
