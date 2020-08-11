require('dotenv').config();

import express = require('express');
import socketio = require('socket.io');

const pino = require('express-pino-logger');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

const http = require('http');
const https = require('https');

import log, { initializeDirectory } from './helpers/logger';
import { WebinarCache, WaitingRooms } from './types/types';

const mongoConfig = require('./database/mongoConfig');
mongoConfig.connectDB(function (err, client) {
  if (err) log('MONGO ERROR', err);
});

const port = process.env.PORT || 8003;

initializeDirectory();

const app = express();
app.set('port', port);

app.use(pino());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: 'BayArea_MoreLike_YayArea',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
    },
  })
);

const server = process.env.NODE_ENV === 'dev' ? http.Server(app) : https.Server(app);
const io = socketio(server);

const webinarCache: WebinarCache = {};
const waitingRooms: WaitingRooms = {};

const TIMEOUT = 1000 * 60 * 60 * 3; // 3 HOURS
const CLEANUP_INTERVAL = 1000 * 60 * 10; // 10 MINUTES
const WAITING_ROOM_TIMEOUT = 1000 * 60 * 60 * 1; // 1 HOUR
const WAITING_ROOM_CLEANUP_INTERVAL = 1000 * 60 * 5; // 5 MINUTES

require('./routes/cache')(app, io, webinarCache, waitingRooms);
require('./routes/user')(app, webinarCache);

require('./socket/socketSetup')(io, webinarCache, waitingRooms);

app.get('/', (req, res) => {
  return res.send('Webinar Cache Micro-Service is Running');
});

function cleanupCache() {
  log('cleanup', 'Running cache cleanup');
  const keys = Object.keys(webinarCache);
  for (let i = 0; i < keys.length; i++) {
    const webinarID = keys[i];
    if (Date.now() - webinarCache[webinarID]['startTime'] >= TIMEOUT)
      delete webinarCache[webinarID];
  }
}

function cleanupWaitingRoom() {
  log('cleanup', 'Running cleanup on waiting rooms');
  const keys = Object.keys(waitingRooms);
  for (let i = keys.length - 1; i >= 0; i--) {
    const webinarID = keys[i];
    const currWebinar = waitingRooms[webinarID];

    const userIDs = Object.keys(currWebinar.users);

    for (let j = userIDs.length - 1; j >= 0; j--) {
      const currID = userIDs[i];
      const currUser = currWebinar.users[currID];

      if (Date.now() - currUser.joinedAt >= WAITING_ROOM_TIMEOUT)
        delete waitingRooms[webinarID].users[userIDs[i]];
    }

    if (Object.keys(currWebinar.users).length === 0) delete waitingRooms[webinarID];
  }
}

setInterval(cleanupCache, CLEANUP_INTERVAL);
setInterval(cleanupWaitingRoom, WAITING_ROOM_CLEANUP_INTERVAL);

server.listen(port, () => {
  log('info', `Webinar cache is listening on port ${port}`);
});
