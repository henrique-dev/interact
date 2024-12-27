import redis from './redis';
import { UserType } from './users';
import { replacer, reviver } from './utils';

export type PairType = {
  role: 'offer' | 'answer';
  state: 'idle' | 'created';
};

export type MeetingType = {
  id: string;
  ownerId: string;
  roomId: string;
  connectionPairs: Map<string, Map<string, PairType>>;
  users: Map<string, UserType>;
};

const meetings = new Map<string, MeetingType>();
const userByMeetings = new Map<string, Set<string>>();

export const getMeeting = async (meetingId: string): Promise<MeetingType | undefined> => {
  try {
    if (redis) {
      const meeting = await redis.get(`meeting:${meetingId}`);
      return meeting ? JSON.parse(meeting, reviver) : undefined;
    } else {
      return meetings.get(meetingId);
    }
  } catch (err) {
    console.warn('cannot get the meeting');
    console.warn(err);
  }
};

export const getMeetingByUser = async (userId: string): Promise<MeetingType | undefined> => {
  try {
    if (redis) {
      const meetingIds = await redis.smembers(`user_meeting_${userId}:index`);

      if (meetingIds.length > 0) {
        return getMeeting(meetingIds[0]);
      }
    } else {
      const meetingIds = userByMeetings.get(userId);

      if (meetingIds) {
        for (const meetingId of meetingIds) {
          return getMeeting(meetingId);
        }
      }
    }
  } catch (err) {
    console.warn('cannot get the user from meeting');
    console.warn(err);
  }

  return undefined;
};

const newMeeting = (ownerId: string, meetingId: string): MeetingType => {
  return {
    id: meetingId,
    ownerId: ownerId,
    roomId: `meeting_${meetingId}`,
    users: new Map(),
    connectionPairs: new Map(),
  };
};

export const createMeeting = async (userId: string): Promise<MeetingType | undefined> => {
  try {
    if (redis) {
      let newId = crypto.randomUUID();
      let meetingExists = await redis.get(`meeting:${newId}`);

      while (meetingExists) {
        newId = crypto.randomUUID();

        meetingExists = await redis.get(`meeting:${newId}`);
      }

      const meeting = newMeeting(userId, newId);

      await redis.set(`meeting:${meeting.id}`, JSON.stringify(meeting, replacer), 'EX', 1800);

      return meeting;
    } else {
      let newId = crypto.randomUUID();

      while (meetings.has(newId)) {
        newId = crypto.randomUUID();
      }

      const meeting = newMeeting(userId, newId);

      meetings.set(meeting.id, meeting);

      return meeting;
    }
  } catch (err) {
    console.warn('cannot create the meeting');
    console.warn(err);
  }
};

export const updateMeeting = async (meeting: MeetingType) => {
  try {
    if (redis) {
      await redis.set(`meeting:${meeting.id}`, JSON.stringify(meeting, replacer), 'EX', 1800);
    }
  } catch (err) {
    console.warn('cannot update the meeting');
    console.warn(err);
  }
};

const addUsersByMeetings = async (userId: string, meeting: MeetingType) => {
  if (redis) {
    try {
      await redis.sadd(`user_meeting_${userId}:index`, meeting.id);
    } catch (err) {
      console.warn('cannot add the user in user_meeting');
      console.warn(err);
    }
  } else {
    if (!userByMeetings.has(userId)) {
      userByMeetings.set(userId, new Set());
    }

    userByMeetings.get(userId)?.add(meeting.id);
  }
};

export const addUserToMeeting = async (meeting: MeetingType, user: UserType) => {
  meeting.users.set(user.id, user);

  await updateMeeting(meeting);
  await addUsersByMeetings(user.id, meeting);
};

const removeUserFromMeetingMap = (meeting: MeetingType, userId: string) => {
  if (meeting.users.has(userId)) {
    const connectionPairs = meeting.connectionPairs;

    if (connectionPairs) {
      connectionPairs.delete(userId);
    }

    for (const connectionPair of connectionPairs.values()) {
      connectionPair.delete(userId);
    }

    meeting.users.delete(userId);
  }
};

export const removeUserFromMeeting = async (userId: string, onUserRemoved: (meeting: MeetingType) => void) => {
  try {
    if (redis) {
      const meetingIds = await redis.smembers(`user_meeting_${userId}:index`);

      for (const meetingId of meetingIds) {
        const meeting = await getMeeting(meetingId);

        if (!meeting) continue;

        removeUserFromMeetingMap(meeting, userId);
        onUserRemoved(meeting);

        await redis.srem(`user_meeting_${userId}:index`, meeting.id);
        await updateMeeting(meeting);
      }
    } else {
      meetings.forEach((meeting) => {
        removeUserFromMeetingMap(meeting, userId);
        onUserRemoved(meeting);

        userByMeetings.get(userId)?.delete(meeting.id);
      });
    }
  } catch (err) {
    console.warn('cannot remove the user from meeting');
    console.warn(err);
  }
};
