import { useCallback, useRef } from 'react';

export const useChannelSubscribers = () => {
  const appEventTargetRef = useRef(new EventTarget());
  const chatEventTargetRef = useRef(new EventTarget());
  const fileEventTargetRef = useRef(new EventTarget());

  const appEmitter = useCallback(
    (userId: string, payload: string) => {
      appEventTargetRef.current.dispatchEvent(
        new CustomEvent('update', {
          detail: { userId, payload },
        })
      );
    },
    [appEventTargetRef]
  );

  const chatEmitter = useCallback(
    (userId: string, payload: string) => {
      chatEventTargetRef.current.dispatchEvent(
        new CustomEvent('update', {
          detail: { userId, payload },
        })
      );
    },
    [chatEventTargetRef]
  );

  const fileEmitter = useCallback(
    (userId: string, payload: string) => {
      fileEventTargetRef.current.dispatchEvent(
        new CustomEvent('update', {
          detail: { userId, payload },
        })
      );
    },
    [fileEventTargetRef]
  );

  const appSubscribe = useCallback((eventHandler: (data: { userId: string; payload: string }) => void) => {
    const onUpdateHandler = (event: Event) => {
      const data = (event as CustomEvent).detail;

      eventHandler(data);
    };

    appEventTargetRef.current.addEventListener('update', onUpdateHandler);

    return () => {
      appEventTargetRef.current.removeEventListener('update', onUpdateHandler);
    };
  }, []);

  const chatSubscribe = useCallback((eventHandler: (data: { userId: string; payload: string }) => void) => {
    const onUpdateHandler = (event: Event) => {
      const data = (event as CustomEvent).detail;

      eventHandler(data);
    };

    chatEventTargetRef.current.addEventListener('update', onUpdateHandler);

    return () => {
      chatEventTargetRef.current.removeEventListener('update', onUpdateHandler);
    };
  }, []);

  const fileSubscribe = useCallback((eventHandler: (data: { userId: string; payload: string }) => void) => {
    const onUpdateHandler = (event: Event) => {
      const data = (event as CustomEvent).detail;

      eventHandler(data);
    };

    fileEventTargetRef.current.addEventListener('update', onUpdateHandler);

    return () => {
      fileEventTargetRef.current.removeEventListener('update', onUpdateHandler);
    };
  }, []);

  return {
    appEmitter,
    chatEmitter,
    fileEmitter,
    appSubscribe,
    chatSubscribe,
    fileSubscribe,
  };
};
