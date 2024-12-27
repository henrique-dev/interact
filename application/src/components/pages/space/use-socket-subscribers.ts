import { useCallback, useRef } from 'react';

export type UserEmitterType = (userId: string, action: UserAction, payload?: string) => void;
export type UserAction = 'onuserenter' | 'onuserleave' | 'onusermove' | 'onusermoved' | 'onrequesttoconnect' | 'onrequesttodisconnect';

export const useSocketSubscribers = () => {
  const userEventTargetRef = useRef(new EventTarget());

  const userEmitter: UserEmitterType = useCallback(
    (userId: string, action: UserAction, payload?: string) => {
      userEventTargetRef.current.dispatchEvent(
        new CustomEvent(action, {
          detail: { userId, payload },
        })
      );
    },
    [userEventTargetRef]
  );

  const userSubscribe = useCallback((action: UserAction, eventHandler: (data: { userId: string; payload: string }) => void) => {
    const onUpdateHandler = (event: Event) => {
      const data = (event as CustomEvent).detail;

      eventHandler(data);
    };

    userEventTargetRef.current.addEventListener(action, onUpdateHandler);

    return () => {
      userEventTargetRef.current.removeEventListener(action, onUpdateHandler);
    };
  }, []);

  return {
    userEmitter,
    userSubscribe,
  };
};
