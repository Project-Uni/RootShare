require('dotenv').config();

import express = require('express');
import pino = require('express-pino-logger');
import bodyParser = require('body-parser');
import expressSession = require('express-session');
import passport = require('passport');
import { log, initializeDirectory } from './helpers/functions';
import * as path from 'path';
import { rateLimiter } from './middleware';

import communityRoutes from './routes/community';
import feedbackRoutes from './routes/feedback';
import discoverRoutes from './routes/discover';
import postRoutes from './routes/posts';

const mongoConfig = require('./config/mongoConfig');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');

// Use mongoose to connect to MongoDB
mongoConfig.connectDB(function (err, client) {
  if (err) log('MONGO ERROR', err);
});

// Load all files in models directory
fs.readdirSync(`${__dirname}/models`).forEach((fileName) => {
  if (~fileName.indexOf('ts')) require(`${__dirname}/models/${fileName}`);
});

initializeDirectory();

const app = express();
const port = process.env.PORT || 8000;

app.use(pino());
app.use(bodyParser.json({ limit: '1.5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: 'TBD',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// app.use(rateLimiter);

const server = http.createServer(app);
const io = socketIO(server);

require('./routes/user')(app);
require('./routes/registrationInternal')(app);
require('./routes/registrationExternal')(app);
require('./routes/messaging')(app, io);

require('./routes/opentok')(app);
require('./routes/event')(app);
require('./routes/utilities')(app);
require('./routes/mocks')(app);

require('./routes/proxy')(app);

require('./routes/images')(app);

//TODO - Replace all routes to match formatting of communityRoutes (export function instead of module.exports = {})
communityRoutes(app);
feedbackRoutes(app);
discoverRoutes(app);
postRoutes(app);

require('./config/setup')(passport);

app.use(express.static(path.join('./', '/frontend/build')));
app.get('*', (_, response) => {
  response.sendFile(path.join(__dirname, '/frontend/build/index.html'));
});

server.listen(8080, () => {
  log('info', `Message Socket Listening on port 8080`);
});

app.listen(port, () => {
  log('info', `Listening on port ${port}`);
});
