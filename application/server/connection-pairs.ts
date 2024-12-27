import { MeetingType, PairType, updateMeeting } from './meetings';

export const getConnectionPair = async (meeting: MeetingType, id: string, anotherId: string) => {
  const connectionPairs = meeting.connectionPairs;

  if (!connectionPairs) return undefined;

  const connectionPair = connectionPairs.get(id);

  if (connectionPair) {
    const anotherPair = connectionPair.get(anotherId);

    if (!anotherPair) {
      connectionPair.set(anotherId, {
        role: 'answer',
        state: 'idle',
      });
    }
  } else {
    connectionPairs.set(id, new Map([[anotherId, { role: 'answer', state: 'idle' }]]));
  }

  await updateMeeting(meeting);

  return connectionPairs.get(id)?.get(anotherId);
};

export const setConnectionPair = async (meeting: MeetingType, id: string, anotherId: string, pairData: PairType) => {
  const connectionPairs = meeting.connectionPairs;

  if (!connectionPairs) return undefined;

  connectionPairs.get(id)?.set(anotherId, pairData);

  await updateMeeting(meeting);
};
