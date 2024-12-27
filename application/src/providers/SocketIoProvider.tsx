'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DefaultEventsMap } from 'socket.io';
import { io, Socket } from 'socket.io-client';

type SocketIoContextProps = {
  userId: string;
  isConnected: boolean | null;
  transport: string;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
};

export const SocketIoContext = React.createContext<SocketIoContextProps>({
  userId: '',
  isConnected: true,
  transport: '',
  socket: null,
});

type SocketIoProviderProps = {
  children: React.ReactNode;
};

export const SocketIoProvider = ({ children }: SocketIoProviderProps) => {
  const [userId, setUserId] = useState('');
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [transport, setTransport] = useState('N/A');

  const onConnect = useCallback(() => {
    setIsConnected(true);

    if (socket) setTransport(socket.io.engine.transport.name);

    socket?.io.engine.on('upgrade', (upgradeTransport) => {
      setTransport(upgradeTransport.name);
    });
  }, [socket, setIsConnected, setTransport]);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
    setTransport('N/A');
  }, [setIsConnected, setTransport]);

  const onRegisterSuccess = useCallback(
    ({ id }: { id: string }) => {
      setUserId(id);
    },
    [setUserId]
  );

  useEffect(() => {
    setSocket(io());
  }, [setSocket]);

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }

    socket?.on('connect', onConnect);
    socket?.on('disconnect', onDisconnect);
    socket?.on('register-created', onRegisterSuccess);

    socket?.emit('register');

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('register-created', onRegisterSuccess);

      socket?.disconnect();
    };
  }, [socket, onConnect, onDisconnect, onRegisterSuccess]);

  return (
    <SocketIoContext.Provider
      value={{
        userId,
        isConnected,
        transport,
        socket,
      }}
    >
      {children}
    </SocketIoContext.Provider>
  );
};
