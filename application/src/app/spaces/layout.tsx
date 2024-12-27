import { SocketIoProvider } from '@/providers/SocketIoProvider';

type SpacesLayoutProps = {
  children: React.ReactNode;
};

const SpacesLayout = ({ children }: SpacesLayoutProps) => {
  return <SocketIoProvider>{children}</SocketIoProvider>;
};

export default SpacesLayout;
