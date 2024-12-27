import redis from './redis';

export type UserType = {
  id: string;
  name: string;
};

const connectedUsers = new Map<string, UserType>();

export const getUser = async (id: string): Promise<UserType | undefined> => {
  try {
    if (redis) {
      const data = await redis.get(`user:${id}`);

      return data ? JSON.parse(data) : undefined;
    } else {
      return connectedUsers.get(id);
    }
  } catch (err) {
    console.log('cannot get the user');
    console.log(err);
  }
};

export const createUser = async (id: string) => {
  const user = {
    id,
    name: '',
    position: {
      x: 0,
      y: 0,
    },
  };

  try {
    if (redis) {
      await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 1800);
      await redis.sadd('users:index', id);
    } else {
      connectedUsers.set(id, user);
    }
  } catch (err) {
    console.log('cannot create the user');
    console.log(err);
  }
};

export const updateUser = async (user: UserType) => {
  try {
    if (redis) {
      await redis.set(`user:${user.id}`, JSON.stringify(user), 'EX', 1800);
    } else {
      connectedUsers.set(user.id, user);
    }
  } catch (err) {
    console.log('cannot update the user');
    console.log(err);
  }
};

export const deleteUser = async (id: string) => {
  if (redis) {
    await redis.del(`user:${id}`);
    await redis.srem('users:index', id);
  } else {
    connectedUsers.delete(id);
  }
};
