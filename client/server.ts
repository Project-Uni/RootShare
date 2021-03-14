const isProd = process.env.NODE_ENV !== 'dev';

const { ELASTIC_APM_SECRET_TOKEN } = require('../keys/keys.json');

require('dotenv').config();

import express = require('express');
import pino = require('express-pino-logger');
import bodyParser = require('body-parser');
import expressSession = require('express-session');
import cors = require('cors');

const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');

import passport = require('passport');
import { log, initializeDirectory } from './helpers/functions';
import * as path from 'path';
import { rateLimiter } from './middleware';
import RootshareRoutes from './routes';

import {
  elasticMiddleware,
  initialize as initializeElasticSearch,
} from './helpers/functions/elasticSearch';

import { connect as connectToDB } from './config/mongoConfig';

connectToDB();

// Load all files in models directory
fs.readdirSync(`${__dirname}/models`).forEach((fileName) => {
  if (~fileName.indexOf('ts')) require(`${__dirname}/models/${fileName}`);
});

const app = express();
const port = process.env.PORT || 8000;

app.set('query parser', 'simple');

app.use(cors());
app.use(pino());
app.use(bodyParser.json({ limit: '3.5mb', type: 'application/json' }));
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

if (isProd) {
  const apm = require('elastic-apm-node').start({
    serviceName: 'rootshare-client',
    secretToken: ELASTIC_APM_SECRET_TOKEN,
    serverUrl:
      'https://6724f1537bfa4853bdbe10cc847f5e5a.apm.us-east-1.aws.cloud.es.io:443',
  });

  initializeDirectory();
  initializeElasticSearch();
  app.use(elasticMiddleware);
}

// app.use(rateLimiter);

//Swagger config
if (!isProd) {
  const swaggerUI = require('swagger-ui-express');
  const swaggerJsdoc = require('swagger-jsdoc');
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'RootShare Swagger Specs',
        version: '0.1.0',
        description: 'Documentation for RootShare API Calls',
        license: {
          name: 'MIT',
          url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
          name: 'RootShare',
          url: 'https://rootshare.io',
          email: 'dev@rootshare.io',
        },
      },
      servers: [
        {
          url: 'http://localhost:8000',
        },
        {
          url: 'http://cache.rootshare.io/api',
        },
      ],
    },
    apis: ['routes/*.ts', 'models/*.ts'],
  };

  const specs = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));
}

const server = http.createServer(app);
const io = socketIO(server);
RootshareRoutes(app, io); // Setup for all routes files

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
