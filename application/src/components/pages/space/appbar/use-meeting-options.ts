import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

export const useMeetingOptions = () => {
  const { socket } = useContext(SocketIoContext);
  const router = useRouter();

  const disconnectUserHandler = () => {
    socket?.emit('exit-meeting');
    router.push('/meetings');
  };

  return {
    disconnectUserHandler,
  };
};
