require('dotenv').config();

import express = require('express');
import pino = require('express-pino-logger');
import bodyParser = require('body-parser');
import expressSession = require('express-session');
import passport = require('passport');
import jwt = require('jsonwebtoken');
import log from './helpers/logger';
import * as path from 'path';

import { rateLimiter } from './middleware';

const mongoConfig = require('./config/mongoConfig');
const fs = require('fs');

// Use mongoose to connect to MongoDB
mongoConfig.connectDB(function (err, client) {
  if (err) log('MONGO ERROR', err);
});

// Load all files in models directory
fs.readdirSync(`${__dirname}/models`).forEach((fileName) => {
  if (~fileName.indexOf('ts')) require(`${__dirname}/models/${fileName}`);
});

const app = express();
const port = process.env.PORT || 8000;

app.use(pino());
app.use(bodyParser.json());
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
app.use(rateLimiter);

require('./routes/user')(app);
require('./routes/registrationInternal')(app);
require('./routes/registrationExternal')(app);
require('./routes/opentok')(app);
require('./routes/utilities')(app);
require('./routes/mocks')(app);

require('./config/setup')(passport);

//TODO - Move jwt code to separate file
// app.get('/testRoute', (req, res) => {
//   const user = { firstName: 'Bobby', lastName: 'Billy', createdAt: 'Hello world!' };
//   const accessToken = generateAccessToken(user);
//   const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET);
//   refreshTokens.push(refreshToken);
//   // const accessToken = jwt.sign(user, process.env.JWT_ACCESS_SECRET);
//   // console.log(accessToken);
//   return res.json({ accessToken, refreshToken });
// });

// let refreshTokens = [];
// app.post('/generateNewAccessToken', (req, res) => {
//   const refreshToken = req.body['token'];
//   if (refreshToken === null)
//     return res.json({ success: 401, message: 'No refresh token' });
//   if (refreshTokens.includes(refreshToken))
//     return res.json({ success: 403, message: 'Refresh token does not exist' });
//   jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
//     if (err) return res.json({ success: 403, message: 'Invalid refresh token' });
//     const accessToken = generateAccessToken({
//       firstName: user.firstName,
//       lastName: user.lastName,
//       createdAt: user.createdAt,
//     });
//     return res.json({ accessToken });
//   });
// });

// function authenticateJWT(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token === null)
//     return res.json({ success: 401, message: 'No token in request' });
//   jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
//     if (err) return res.json({ success: 403, message: 'Invalid token' });
//     req.user = user;
//     next();
//   });
// }

// function generateAccessToken(generatingInfo) {
//   return jwt.sign(generatingInfo, process.env.JWT_ACCESS_SECRET, {
//     //TODO - Set this to somewhere between 15 - 30 mins.
//     expiresIn: '30s',
//   });
// }

// app.delete('/revokeAccess', (req, res) => {
//   refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
//   return res.json({ success: 1, message: 'Successfully revoked token access' });
// });
//END - End of JWT Code

app.use(express.static(path.join('./', '/frontend/build')));
app.get('*', (_, response) => {
  response.sendFile(path.join(__dirname, '/frontend/build/index.html'));
});

app.listen(port, () => {
  log('info', `Listening on port ${port}`);
});
