#!./node_modules/.bin/babel-node

/* eslint-disable no-console */

import Y from 'yjs';
import yWebsocketsServer from 'y-websockets-server';
import yMemory from 'y-memory';

import minimist from 'minimist';
import socketIo from 'socket.io';

Y.extend(yWebsocketsServer, yMemory);

const options = minimist(process.argv.slice(2), {
  string: ['port', 'debug', 'db'],
  default: {
    port: process.env.PORT || '1234',
    debug: false,
    db: 'memory',
  },
});

const port = Number.parseInt(options.port, 10);
const io = socketIo(port);
console.log(`Running y-websockets-server on port ${port}`);

const yInstances = {};

function getInstanceOfY(room) {
  if (yInstances[room] == null) {
    yInstances[room] = Y({
      db: {
        name: options.db,
        dir: 'y-leveldb-databases',
        namespace: room,
      },
      connector: {
        name: 'websockets-server',
        room,
        io,
        debug: !!options.debug,
      },
      share: {},
    });
  }
  return yInstances[room];
}

io.on('connection', (socket) => {
  const rooms = [];
  socket.on('joinRoom', (room) => {
    console.log('User', socket.id, 'joins room:', room);
    socket.join(room);
    getInstanceOfY(room).then((y) => {
      if (rooms.indexOf(room) === -1) {
        y.connector.userJoined(socket.id, 'slave');
        rooms.push(room);
      }
    });
  });
  socket.on('yjsEvent', (msg) => {
    if (msg.room != null) {
      getInstanceOfY(msg.room).then((y) => {
        y.connector.receiveMessage(socket.id, msg);
      });
    }
  });
  socket.on('disconnect', () => {
    for (let i = 0; i < rooms.length; i += 1) {
      const room = rooms[i];
      getInstanceOfY(room).then((y) => {
        const j = rooms.indexOf(room);
        if (j >= 0) {
          y.connector.userLeft(socket.id);
          rooms.splice(j, 1);
        }
      });
    }
  });
  socket.on('leaveRoom', (room) => {
    getInstanceOfY(room).then((y) => {
      const i = rooms.indexOf(room);
      if (i >= 0) {
        y.connector.userLeft(socket.id);
        rooms.splice(i, 1);
      }
    });
  });
});
