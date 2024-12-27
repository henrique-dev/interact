import React, { useCallback, useState } from 'react';

export type UserType = {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  state: 'connecting' | 'connected';
};

type ApplicationContextProps = {
  spaceId: string;
  currentUsers: UserType[];
  meetingUsers: UserType[];
  addUser: (user: UserType) => void;
  updateUser: (user: UserType) => void;
  removeUser: (user: UserType) => void;
  addMeetingUser: (user: UserType) => void;
  updateMeetingUser: (user: UserType) => void;
  removeMeetingUser: (userId: string) => void;
  clearMeetingUsers: () => void;
};

export const ApplicationContext = React.createContext<ApplicationContextProps>({
  spaceId: '',
  currentUsers: [],
  meetingUsers: [],
  addUser: () => undefined,
  updateUser: () => undefined,
  removeUser: () => undefined,
  addMeetingUser: () => undefined,
  updateMeetingUser: () => undefined,
  removeMeetingUser: () => undefined,
  clearMeetingUsers: () => undefined,
});

type ApplicationProviderProps = {
  spaceId: string;
  children: React.ReactNode;
};

export const ApplicationProvider = ({ spaceId, children }: ApplicationProviderProps) => {
  const [currentUsers, setCurrentUsers] = useState<UserType[]>([]);
  const [meetingUsers, setMeetingUsers] = useState<UserType[]>([]);

  const addUser = useCallback(
    (user: UserType) => {
      setCurrentUsers((oldUsers) => {
        if (oldUsers.find((userToFInd) => userToFInd.id === user.id)) {
          return [...oldUsers];
        } else {
          return [...oldUsers, user];
        }
      });
    },
    [setCurrentUsers]
  );

  const addMeetingUser = useCallback(
    (user: UserType) => {
      setMeetingUsers((oldUsers) => {
        if (oldUsers.find((userToFInd) => userToFInd.id === user.id)) {
          return [...oldUsers];
        } else {
          return [...oldUsers, user];
        }
      });
    },
    [setMeetingUsers]
  );

  const updateUser = useCallback(
    (user: UserType) => {
      setCurrentUsers((oldUsers) => {
        const newUsers = [...oldUsers];
        const userIndex = newUsers.findIndex((userToFInd) => userToFInd.id === user.id);
        if (userIndex >= 0) {
          newUsers[userIndex] = {
            ...newUsers[userIndex],
            ...user,
          };
        }
        return newUsers;
      });
    },
    [setCurrentUsers]
  );

  const updateMeetingUser = useCallback(
    (user: UserType) => {
      setMeetingUsers((oldUsers) => {
        const newUsers = [...oldUsers];
        const userIndex = newUsers.findIndex((userToFInd) => userToFInd.id === user.id);
        if (userIndex >= 0) {
          newUsers[userIndex] = {
            ...newUsers[userIndex],
            ...user,
          };
        }
        return newUsers;
      });
    },
    [setMeetingUsers]
  );

  const removeUser = useCallback(
    (user: UserType) => {
      setCurrentUsers((oldUsers) => oldUsers.filter((oldUser) => oldUser.id !== user.id));
    },
    [setCurrentUsers]
  );

  const removeMeetingUser = useCallback(
    (userId: string) => {
      setMeetingUsers((oldUsers) => oldUsers.filter((oldUser) => oldUser.id !== userId));
    },
    [setMeetingUsers]
  );

  const clearMeetingUsers = useCallback(() => {
    setMeetingUsers([]);
  }, [setMeetingUsers]);

  return (
    <ApplicationContext.Provider
      value={{
        spaceId,
        currentUsers,
        meetingUsers,
        addUser,
        updateUser,
        removeUser,
        addMeetingUser,
        updateMeetingUser,
        removeMeetingUser,
        clearMeetingUsers,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
