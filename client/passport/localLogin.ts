const LocalStrategy = require('passport-local').Strategy;
import mongoose = require('mongoose');

const User = mongoose.model('users');

import { generateJWT, isValidPassword } from '../helpers/functions';

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
          User.findOne({ email: { $regex: email, $options: 'i' } }, function (
            err,
            user
          ) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'User Not Found' });
            if (user.hashedPassword === undefined)
              return done(null, false, {
                message: 'User has not signed up locally',
              });
            if (!isValidPassword(user, password))
              return done(null, false, { message: 'Invalid Password' });

            const JWT = generateJWT(user);
            return done(null, user, {
              message: 'Found user and logged in',
              jwtAccessToken: JWT.accessToken,
              jwtRefreshToken: JWT.refreshToken,
            });
          });
        });
      }
    )
  );
};
