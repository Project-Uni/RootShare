var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('users');
var University = mongoose.model('universities');
var bCrypt = require('bcryptjs');
import jwt = require('jsonwebtoken');

import { JWT_TOKEN_FIELDS, JWT_ACCESS_TOKEN_TIMEOUT } from '../types/types';

var {
  sendConfirmationEmail,
} = require('../interactions/registration/email-confirmation');

module.exports = function (passport) {
  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        passReqToCallback: true, // allows us to pass back the entire request to the callback
        usernameField: 'email',
      },
      function (req, email, password, done) {
        function findOrCreateUser() {
          // find a user in Mongo with provided email address
          User.findOne({ email: email }, async function (err, user) {
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, false, { message: 'User Already Exists.' });
            } else {
              // if there is no user with that email, create new
              var newUser = new User();

              // set the user's required credentials
              newUser.firstName = req.body.firstName;
              newUser.lastName = req.body.lastName;
              newUser.email = email;
              newUser.hashedPassword = createHash(password);
              newUser.accountType = req.body.accountType;

              let university = await University.findOne({
                universityName: req.body.university,
              });
              if (!university || university === undefined || university === null) {
                return done(null, false, { message: 'University Not Found' });
              }
              newUser.university = university;

              // save the user
              newUser.save(function (err) {
                if (err) {
                  return done(err);
                }

                sendConfirmationEmail(email);

                const userTokenInfo = {};
                for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++)
                  userTokenInfo[JWT_TOKEN_FIELDS[i]] = newUser[JWT_TOKEN_FIELDS[i]];
                const jwtAccessToken = jwt.sign(
                  userTokenInfo,
                  process.env.JWT_ACCESS_SECRET
                  // { expiresIn: JWT_ACCESS_TOKEN_TIMEOUT }
                );
                const jwtRefreshToken = jwt.sign(
                  userTokenInfo,
                  process.env.JWT_REFRESH_SECRET
                );
                return done(null, newUser, {
                  message: 'User Registration Succesful!',
                  jwtAccessToken,
                  jwtRefreshToken,
                });
              });
            }
          });
        }

        process.nextTick(findOrCreateUser);
      }
    )
  );

  // Generates hash using bCrypt
  var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };
};
