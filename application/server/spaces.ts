import redis from './redis';
import { UserType } from './users';
import { replacer } from './utils';

type SpaceUserType = UserType & {
  position: {
    x: number;
    y: number;
  };
};

type SpaceType = {
  id: string;
  ownerId: string;
  roomId: string;
  users: Map<string, SpaceUserType>;
};

const spaces = new Map<string, SpaceType>();
const userBySpaces = new Map<string, Set<string>>();

export const getSpace = async (spaceId: string) => {
  return spaces.get(spaceId);
};

const newSpace = (ownerId: string, spaceId: string): SpaceType => {
  return {
    id: spaceId,
    ownerId: ownerId,
    roomId: `space_${spaceId}`,
    users: new Map(),
  };
};

export const createSpace = async (userId: string) => {
  try {
    if (redis) {
      let newId = crypto.randomUUID();
      let spaceExists = await redis.get(`space:${newId}`);

      while (spaceExists) {
        newId = crypto.randomUUID();

        spaceExists = await redis.get(`space:${newId}`);
      }

      const space = newSpace(userId, newId);

      await redis.set(`space:${space.id}`, JSON.stringify(space, replacer), 'EX', 1800);

      return space;
    } else {
      let newId = crypto.randomUUID();

      while (spaces.has(newId)) {
        newId = crypto.randomUUID();
      }

      const space = newSpace(userId, newId);

      spaces.set(space.id, space);

      return space;
    }
  } catch (err) {
    console.warn('cannot create the space');
    console.warn(err);
  }
};

export const updateSpace = async (space: SpaceType) => {
  try {
    if (redis) {
      await redis.set(`space:${space.id}`, JSON.stringify(space, replacer), 'EX', 1800);
    }
  } catch (err) {
    console.warn('cannot update the space');
    console.warn(err);
  }
};

const addUsersBySpaces = async (userId: string, space: SpaceType) => {
  if (redis) {
    try {
      await redis.sadd(`user_space_${userId}:index`, space.id);
    } catch (err) {
      console.warn('cannot add the user in user_space');
      console.warn(err);
    }
  } else {
    if (!userBySpaces.has(userId)) {
      userBySpaces.set(userId, new Set());
    }

    userBySpaces.get(userId)?.add(space.id);
  }
};

export const addUserToSpace = async (space: SpaceType, user: SpaceUserType) => {
  space.users.set(user.id, user);

  await updateSpace(space);
  await addUsersBySpaces(user.id, space);
};

const removeUserFromSpaceMap = (space: SpaceType, userId: string) => {
  if (space.users.has(userId)) {
    space.users.delete(userId);
  }
};

export const removeUserFromSpace = async (userId: string, onUserRemoved: (space: SpaceType) => void) => {
  try {
    if (redis) {
      const spaceIds = await redis.smembers(`user_space_${userId}:index`);

      for (const spaceId of spaceIds) {
        const space = await getSpace(spaceId);

        if (!space) continue;

        removeUserFromSpaceMap(space, userId);
        onUserRemoved(space);

        await redis.srem(`user_space_${userId}:index`, space.id);
        await updateSpace(space);
      }
    } else {
      spaces.forEach((space) => {
        removeUserFromSpaceMap(space, userId);
        onUserRemoved(space);
      });
    }
  } catch (err) {
    console.warn('cannot remove the user from space');
    console.warn(err);
  }
};
