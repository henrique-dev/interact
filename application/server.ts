import fs from 'fs';
import http from 'http';
import https from 'https';
import next from 'next';
import { Server } from 'socket.io';
import { getConnectionPair, setConnectionPair } from './server/connection-pairs';
import { addUserToMeeting, createMeeting, getMeeting, getMeetingByUser, removeUserFromMeeting } from './server/meetings';
import { addUserToSpace, createSpace, getSpace, removeUserFromSpace, updateSpace } from './server/spaces';
import { createUser, deleteUser, getUser } from './server/users';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const createServer = () => {
  if (dev) {
    const key = fs.readFileSync('certificates/cert.key');
    const cert = fs.readFileSync('certificates/cert.crt');

    return https.createServer({ key, cert }, handler);
  } else {
    return http.createServer(handler);
  }
};

app.prepare().then(async () => {
  const httpServer = createServer();

  const io = new Server(httpServer, {});

  io.on('connection', async (socket) => {
    await createUser(socket.id);

    const getUserAndValidate = async (userId: string) => {
      const user = await getUser(userId);

      if (user) return user;

      socket.emit('invalid-space');

      return undefined;
    };

    const getSpaceAndValidate = async (spaceId: string) => {
      const space = await getSpace(spaceId);

      if (space) return space;

      socket.emit('invalid-space');

      return undefined;
    };

    const getMeetingAndValidate = async (meetingId: string) => {
      const meeting = await getMeeting(meetingId);

      if (meeting) return meeting;

      // socket.emit('invalid-meeting');

      return undefined;
    };

    socket.on('register', async () => {
      const user = await getUserAndValidate(socket.id);

      if (!user) return;

      socket.emit('register-created', user);
    });

    socket.on('create-space', async () => {
      const space = await createSpace(socket.id);

      socket.emit('space-created', space);
    });

    socket.on('enter-space', async (data) => {
      const { spaceId, userName } = data;

      const user = await getUserAndValidate(socket.id);

      if (!user) return;

      const space = await getSpaceAndValidate(spaceId);

      if (!space) return;

      socket.join(space.roomId);

      await addUserToSpace(space, {
        ...user,
        name: userName,
        position: {
          x: 27,
          y: 5,
        },
      });

      io.to(space.roomId).emit('user-enter-space', { users: Array.from(space.users.values()) });
    });

    socket.on('user-move', async (data) => {
      const { spaceId, userData } = data;

      const user = await getUserAndValidate(socket.id);

      if (!user) return;

      const space = await getSpaceAndValidate(spaceId);

      if (!space) return;

      const userFromSpace = space.users.get(socket.id);

      if (!userFromSpace) return;

      userFromSpace.position = {
        x: userData.x,
        y: userData.y,
      };

      await updateSpace(space);

      socket.to(space.roomId).emit('user-move', { user, data: userData });
    });

    socket.on('create-meeting', async (data) => {
      const { spaceId, userId } = data;

      const user = await getUserAndValidate(socket.id);

      if (!user) return;

      const space = await getSpaceAndValidate(spaceId);

      if (!space) return;

      const userFromSpace = space.users.get(socket.id);

      if (!userFromSpace) return;

      const otherUserFromSpace = space.users.get(userId);

      if (!otherUserFromSpace) return;

      let meeting = await getMeetingByUser(userId);

      if (!meeting) {
        meeting = await createMeeting(socket.id);
      }

      if (!meeting) return;

      await addUserToMeeting(meeting, {
        ...userFromSpace,
      });
      await addUserToMeeting(meeting, {
        ...otherUserFromSpace,
      });

      socket.join(meeting.roomId);
      io.sockets.sockets.get(userId)?.join(meeting.roomId);

      io.to(meeting.roomId).emit('user-enter-meeting', { meetingId: meeting.id, users: Array.from(meeting.users.values()) });
    });

    socket.on('decide-offer-answer', async (data) => {
      const { meetingId, anotherUserId } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, anotherUserId);
      const anotherUserPair = await getConnectionPair(meeting, anotherUserId, socket.id);

      if (!userPair || !anotherUserPair) return;

      if (userPair.state === 'idle' && anotherUserPair.state === 'idle') {
        const offer = Math.random() < 0.5;

        userPair.role = offer ? 'offer' : 'answer';
        userPair.state = 'created';
        await setConnectionPair(meeting, socket.id, anotherUserId, userPair);

        anotherUserPair.role = offer ? 'answer' : 'offer';
        anotherUserPair.state = 'created';
        await setConnectionPair(meeting, anotherUserId, socket.id, anotherUserPair);
      }

      if (userPair.role === 'offer') {
        socket.emit('create-offer', { meetingId: meeting.id, peerId: anotherUserId });
      } else {
        io.to(anotherUserId).emit('create-offer', { meetingId: meeting.id, peerId: socket.id });
      }
    });

    socket.on('offer', async (data) => {
      const { meetingId, toId, offer } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'answer') {
        socket.emit('create-answer', { meetingId: meeting.id, peerId: toId, offer });
      } else {
        io.to(toId).emit('create-answer', { meetingId: meeting.id, peerId: socket.id, offer });
      }
    });

    socket.on('answer', async (data) => {
      const { meetingId, toId, answer } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'offer') {
        socket.emit('answer-found', { meetingId: meeting.id, peerId: toId, answer });
      } else {
        io.to(toId).emit('answer-found', { meetingId: meeting.id, peerId: socket.id, answer });
      }
    });

    socket.on('offer-candidates', async (data) => {
      const { meetingId, toId, candidate } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'answer') {
        socket.emit('offer-candidate', { meetingId: meeting.id, peerId: toId, candidate });
      } else {
        io.to(toId).emit('offer-candidate', { meetingId: meeting.id, peerId: socket.id, candidate });
      }
    });

    socket.on('answer-candidates', async (data) => {
      const { meetingId, toId, candidate } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'offer') {
        socket.emit('answer-candidate', { meetingId: meeting.id, peerId: toId, candidate });
      } else {
        io.to(toId).emit('answer-candidate', { meetingId: meeting.id, peerId: socket.id, candidate });
      }
    });

    socket.on('leave-meeting', async () => {
      await removeUserFromMeeting(socket.id, (meeting) => {
        console.log('user removed');
        io.to(meeting.roomId).emit('user-leave-meeting', { id: socket.id });
      });
    });

    socket.on('disconnect', async () => {
      await removeUserFromSpace(socket.id, (space) => {
        io.to(space.roomId).emit('user-leave-space', { id: socket.id });
      });

      await deleteUser(socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      if (dev) {
        console.log(`> Ready on https://${hostname}:${port}`);
      } else {
        console.log(`> Ready on http://${hostname}:${port}`);
      }
    });
});
