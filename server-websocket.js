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
import clone from 'lodash/clone';
import crypto from 'crypto';

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
        // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
        room: encodeURIComponent(room),
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

function getSha1Hash(plaintext) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(plaintext);
  return sha1.digest('hex');
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
  socket.on('joinRoom', (escapedRoom) => {
    // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
    const room = decodeURIComponent(escapedRoom);
    console.log('User', socket.id, 'joins room:', room);
    socket.join(escapedRoom);
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
      // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
      const room = decodeURIComponent(msg.room);
      getInstanceOfY(room).then((y) => {
        y.connector.receiveMessage(socket.id, msg);
        if (msg.type === 'update') {
          metadata[room].modified = new Date();
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
          // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
          const escapedRoom = encodeURIComponent(room);
          io.in(escapedRoom).emit('activeUser', metadata[room].active);
          io.in(escapedRoom).emit('clientCursor', { type: 'delete', id: getSha1Hash(socket.id) });
        }
      });
    }
  });
  socket.on('leaveRoom', (escapedRoom) => {
    // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
    const room = decodeURIComponent(escapedRoom);
    getInstanceOfY(room).then((y) => {
      const i = rooms.indexOf(room);
      if (i >= 0) {
        y.connector.userLeft(socket.id);
        rooms.splice(i, 1);
        metadata[room].active -= 1;
        io.in(room).emit('activeUser', metadata[room].active);
        io.in(room).emit('clientCursor', { type: 'delete', id: getSha1Hash(socket.id) });
      }
    });
  });
  socket.on('clientCursor', (msg) => {
    if (msg.room != null) {
      const msgCloned = clone(msg);
      msgCloned.id = getSha1Hash(socket.id);
      // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
      socket.to(encodeURIComponent(msg.room)).emit('clientCursor', msgCloned);
    }
  });
});

server.listen(port, () => {
  console.log(`Running y-websockets-server on port ${port}`);
});
