import { getMap } from '@/actions/get-map';
import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserType } from './ApplicationProvider';
import { Engine } from './engine/engine';
import { SocketListenersContext } from './SocketListenersProvider';
import { SpaceContext } from './SpaceProvider';

export const useCanvas = () => {
  const { userId, isConnected } = useContext(SocketIoContext);
  const { userEmitter, userSubscribe } = useContext(SocketListenersContext);
  const { setCanvasLoaded } = useContext(SpaceContext);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine>(null);
  const [idleImageLoaded, setIdleImageLoaded] = useState(false);
  const [walkImageLoaded, setWalkImageLoaded] = useState(false);
  const [houseImageLoaded, setHouseImageLoaded] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const registerCanvasElementRefHandler = (element: HTMLCanvasElement | null) => {
    if (!element) return;

    canvasElementRef.current = element;
  };

  useEffect(() => {
    if (!assetsLoaded || userId === '' || !isConnected) return;

    getMap()
      .then((data) => {
        const canvas = canvasElementRef.current;

        if (!canvas) return;

        engineRef.current = new Engine(canvas, userId, userEmitter, data);

        engineRef.current.start();

        setCanvasLoaded(true);
      })
      .catch((err) => {
        console.warn('cannot load the map');
        console.warn(err);
      });

    const userEnterUnsubscribe = userSubscribe('onuserenter', ({ payload }) => {
      const user = JSON.parse(payload) as UserType;

      if (!engineRef.current) return;

      engineRef.current.addOtherPlayer(user);
    });

    const useLeaveUnsubscribe = userSubscribe('onuserleave', ({ userId: anotherUserId }) => {
      if (!engineRef.current) return;

      engineRef.current.removeOtherPlayer(anotherUserId);
    });

    const userMoveUnsubscribe = userSubscribe('onusermoved', ({ userId: anotherUserId, payload }) => {
      const data = JSON.parse(payload);

      if (!engineRef.current) return;

      engineRef.current.onOtherPlayerMove(anotherUserId, data);
    });

    return () => {
      engineRef.current?.stop();

      userEnterUnsubscribe();
      useLeaveUnsubscribe();
      userMoveUnsubscribe();
    };
  }, [userId, isConnected, assetsLoaded, userSubscribe, userEmitter, setCanvasLoaded]);

  useEffect(() => {
    if (!idleImageLoaded || !walkImageLoaded || !houseImageLoaded) return;

    setAssetsLoaded(true);
  }, [idleImageLoaded, walkImageLoaded, houseImageLoaded, setAssetsLoaded]);

  return { registerCanvasElementRefHandler, setIdleImageLoaded, setWalkImageLoaded, setHouseImageLoaded };
};
