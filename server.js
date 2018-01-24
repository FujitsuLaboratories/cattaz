#!./node_modules/.bin/babel-node

import 'babel-polyfill';

/* eslint-disable no-console */

import Y from 'yjs';
import yWebsocketsServer from 'y-websockets-server';
import yleveldb from 'y-leveldb';

import express from 'express';
import socketIo from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser';
import clone from 'lodash/clone';
import crypto from 'crypto';

import LevelDBLib from './src/server/LevelDBLib';

Y.extend(yWebsocketsServer, yleveldb);

const isProduction = process.env.NODE_ENV === 'production';
const serverMode = process.env.SERVER_MODE;

const port = Number.parseInt(process.env.PORT || '8080', 10);
const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);
const bodyParserText = bodyParser.text();

const yInstances = {};
const metadata = LevelDBLib.restoreMetadata('y-leveldb-databases');

function getInstanceOfY(room) {
  if (yInstances[room] == null) {
    yInstances[room] = Y({
      db: {
        name: 'leveldb',
        dir: 'y-leveldb-databases',
        namespace: LevelDBLib.escapeNamespace(room),
      },
      connector: {
        name: 'websockets-server',
        // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
        room: encodeURIComponent(room),
        io,
        debug: !isProduction,
      },
      share: {},
    });
    if (!metadata[room]) {
      metadata[room] = {
        created: new Date(),
        modified: new Date(),
        active: 0,
      };
    }
  }
  return yInstances[room];
}
function removeInstanceOfY(room) {
  delete yInstances[room];
  delete metadata[room];
}

function getSha1Hash(plaintext) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(plaintext);
  return sha1.digest('hex');
}

app.get('/pages', (req, res) => {
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

app.post('/deletePage', bodyParserText, async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const room = req.body;
  const yPromise = yInstances[room];
  if (!yPromise) {
    res.end(JSON.stringify({ status: 'FAILURE', msg: 'No y instance' }));
    return;
  }
  try {
    const y = await yPromise;
    const roomMetadata = metadata[room];
    if (!roomMetadata) {
      res.end(JSON.stringify({ status: 'FAILURE', msg: 'No metadata' }));
      return;
    }
    if (roomMetadata.active > 0) {
      res.end(JSON.stringify({ status: 'FAILURE', msg: 'There are still users on this page' }));
      return;
    }
    try {
      await y.destroy();
      removeInstanceOfY(room);
      res.end(JSON.stringify({ status: 'SUCCESS', msg: `Delete ${room}` }));
    } catch (ex) {
      console.error(ex);
      res.end(JSON.stringify({ status: 'FAILURE', msg: 'Y instance destroy error' }));
    }
  } catch (ex) {
    console.error(ex);
    res.end(JSON.stringify({ status: 'FAILURE', msg: ex }));
  }
});

io.on('connection', (socket) => {
  const rooms = [];
  socket.on('joinRoom', async (escapedRoom) => {
    // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
    const room = decodeURIComponent(escapedRoom);
    console.log('User', socket.id, 'joins room:', room);
    socket.join(escapedRoom);
    const y = await getInstanceOfY(room);
    if (rooms.indexOf(room) === -1) {
      y.connector.userJoined(socket.id, 'slave');
      rooms.push(room);
      metadata[room].active += 1;
      io.in(escapedRoom).emit('activeUser', metadata[room].active);
    }
  });
  socket.on('yjsEvent', async (msg) => {
    if (msg.room != null) {
      // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
      const room = decodeURIComponent(msg.room);
      const y = await getInstanceOfY(room);
      y.connector.receiveMessage(socket.id, msg);
      if (msg.type === 'update') {
        metadata[room].modified = new Date();
      }
    }
  });
  socket.on('disconnect', async () => {
    await Promise.all(rooms.map(async (room) => {
      const y = await getInstanceOfY(room);
      y.connector.userLeft(socket.id);
      metadata[room].active -= 1;
      // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
      const escapedRoom = encodeURIComponent(room);
      io.in(escapedRoom).emit('activeUser', metadata[room].active);
      io.in(escapedRoom).emit('clientCursor', { type: 'delete', id: getSha1Hash(socket.id) });
      if (metadata[room].active === 0) {
        LevelDBLib.closeDatabase(y).then(() => {
          delete yInstances[room];
        }, (ex) => {
          console.error(ex);
        });
      }
    }));
    rooms.splice(0, rooms.length);
  });
  socket.on('leaveRoom', async (escapedRoom) => {
    // TODO: Will be solved in future https://github.com/y-js/y-websockets-server/commit/2c8588904a334631cb6f15d8434bb97064b59583#diff-e6a5b42b2f7a26c840607370aed5301a
    const room = decodeURIComponent(escapedRoom);
    const y = await getInstanceOfY(room);
    const i = rooms.indexOf(room);
    if (i >= 0) {
      y.connector.userLeft(socket.id);
      rooms.splice(i, 1);
      metadata[room].active -= 1;
      io.in(room).emit('activeUser', metadata[room].active);
      io.in(room).emit('clientCursor', { type: 'delete', id: getSha1Hash(socket.id) });
      if (metadata[room].active === 0) {
        LevelDBLib.closeDatabase(y).then(() => {
          delete yInstances[room];
        }, (ex) => {
          console.error(ex);
        });
      }
    }
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

switch (serverMode) {
  case 'storybook':
    break;
  case 'landingpage':
    app.use(express.static('.'));
    break;
  default:
    if (isProduction) {
      app.use(express.static('build'));
    } else {
      /* eslint-disable global-require, import/no-extraneous-dependencies */
      const webpackConfig = require('./webpack.config.babel.js').default;
      const webpack = require('webpack');
      const webpackDevMiddleware = require('webpack-dev-middleware');
      const webpackHotMiddleware = require('webpack-hot-middleware');
      /* eslint-enable global-require */
      const compiler = webpack(webpackConfig);
      app.use(webpackDevMiddleware(compiler));
      app.use(webpackHotMiddleware(compiler));
    }
}

server.listen(port, () => {
  console.log(`Running y-websockets-server on port ${port}`);
});
