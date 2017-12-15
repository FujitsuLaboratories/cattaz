#!./node_modules/.bin/babel-node

/* eslint-disable no-console */

import Y from 'yjs';
import yWebsocketsServer from 'y-websockets-server';
import yMemory from 'y-memory';

import minimist from 'minimist';
import socketIo from 'socket.io';
import http from 'http';
import Router from 'router';
import finalhandler from 'finalhandler';

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
const router = Router();
const server = http.createServer((req, res) => {
  router(req, res, finalhandler(req, res));
});
const io = socketIo.listen(server);

const yInstances = {};
const metadata = {};

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
    metadata[room] = {
      created: new Date(),
      modified: new Date(),
      active: 0,
    };
  }
  return yInstances[room];
}

router.get('/pages', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(Object.keys(metadata).map((k) => {
    const m = metadata[k];
    return {
      page: k,
      created: m.created,
      modified: m.modified,
      active: m.active,
    };
  })));
});

io.on('connection', (socket) => {
  const rooms = [];
  socket.on('joinRoom', (room) => {
    console.log('User', socket.id, 'joins room:', room);
    socket.join(room);
    getInstanceOfY(room).then((y) => {
      if (rooms.indexOf(room) === -1) {
        y.connector.userJoined(socket.id, 'slave');
        rooms.push(room);
        metadata[room].active += 1;
        io.in(room).emit('activeUser', metadata[room].active);
      }
    });
  });
  socket.on('yjsEvent', (msg) => {
    if (msg.room != null) {
      getInstanceOfY(msg.room).then((y) => {
        y.connector.receiveMessage(socket.id, msg);
        if (msg.type === 'update') {
          metadata[msg.room].modified = new Date();
        }
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
          metadata[room].active -= 1;
          io.in(room).emit('activeUser', metadata[room].active);
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
        metadata[room].active -= 1;
        io.in(room).emit('activeUser', metadata[room].active);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Running y-websockets-server on port ${port}`);
});
