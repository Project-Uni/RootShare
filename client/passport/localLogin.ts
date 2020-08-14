const LocalStrategy = require('passport-local').Strategy;
import mongoose = require('mongoose');
import bCrypt = require('bcryptjs');
import jwt = require('jsonwebtoken');

const User = mongoose.model('users');

import { JWT_TOKEN_FIELDS, JWT_ACCESS_TOKEN_TIMEOUT } from '../types/types';

module.exports = function (passport) {
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      function (req, email, password, done) {
        process.nextTick(function () {
          // check in mongo if a user with username exists or not
          email = email.toLowerCase();
          User.findOne({ email: email }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'User Not Found' });

            if (user.hashedPassword === undefined) {
              return done(null, false, {
                message: 'User has not signed up locally',
              });
            }
            if (!isValidPassword(user, password)) {
              return done(null, false, { message: 'Invalid Password' });
            }

            const userTokenInfo = {};
            for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++)
              userTokenInfo[JWT_TOKEN_FIELDS[i]] = user[JWT_TOKEN_FIELDS[i]];
            const jwtAccessToken = jwt.sign(
              userTokenInfo,
              process.env.JWT_ACCESS_SECRET
              // { expiresIn: JWT_ACCESS_TOKEN_TIMEOUT }
            );
            const jwtRefreshToken = jwt.sign(
              userTokenInfo,
              process.env.JWT_REFRESH_SECRET
            );

            return done(null, user, {
              message: 'Found user and logged in',
              jwtAccessToken,
              jwtRefreshToken,
            });
          });
        });
      }
    )
  );

  var isValidPassword = function (user, password) {
    if (password === user.hashedPassword) {
      return true;
    }

    return bCrypt.compareSync(password, user.hashedPassword);
  };
};
