require('dotenv').config();

import express = require('express');
import socketio = require('socket.io');

const pino = require('express-pino-logger');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const http = require('http');

import log from './helpers/logger';
import { WebinarCache } from './types/types';

const port = process.env.PORT || 8003;

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

const server = http.Server(app);
const io = socketio(server);

const webinarCache: WebinarCache = {};

const TIMEOUT = 1000 * 60 * 60 * 3; // 3 HOURS
const CLEANUP_INTERVAL = 1000 * 60 * 10; //10 MINUTES

require('./routes/cache')(app, webinarCache);
require('./routes/user')(app, webinarCache);

require('./socket/socketSetup')(io, webinarCache);

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

setInterval(cleanupCache, CLEANUP_INTERVAL); //10 MINUTES

server.listen(port, () => {
  log('info', `Webinar cache is listening on port ${port}`);
});
